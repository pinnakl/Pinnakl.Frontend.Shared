import { Injectable } from '@angular/core';
import { ClientConnectivity, ClientConnectivityFromApi, DynamicEntity } from '@pnkl-frontend/shared';

import { chain } from 'lodash';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { LastRunDetails } from '../../shared/last-run-details.model';
import { TaskObject } from '../../shared/task-object.model';
import { TaskParam } from '../../shared/task-param.model';
import { TaskStatusDetailFromApi } from '../../shared/task-status-detail-from-api.model';
import { TaskStatusDetail } from '../../shared/task-status-detail.model';
import { Task } from '../../shared/task.model';

import {
  EventActionType,
  EventEndpoint,
  ServerSentEventsStreamService,
  WebServiceProvider
} from '@pnkl-frontend/core';
import { UserService } from '@pnkl-frontend/core';
import { FileService } from '@pnkl-frontend/shared';
import { environment } from '../../../../environments';
import { RecommendedActionFromApi } from '../recommended-actions/recommended-action-from-api.model';
import { RecommendedAction } from '../recommended-actions/recommended-action.model';
import { ActionApiModel } from './action-api.model';
import { ActivitySummaryModel } from './activity-summary.model';
import { AlertApiModel } from './alert-api.model';
import { AlertModel } from './alert.model';
import { DashboardBackend } from './dashboard-backend.model';
import { PnlByAssetApiModel } from './pnl-by-asset-api.model';
import { PnlBySectorApiModel } from './pnl-by-sector-api.model';
import { PnlExposure } from './pnl-exposure.model';
import { PnlModel } from './pnl.model';
import { PositionEventApiModel } from './position-event-api.model';
import { PositionEventModel } from './position-event.model';
import { ProfitLossApiModel } from './profit-loss-api.model';

@Injectable()
export class DashboardService {
  private readonly _tasksEndpoint = 'entities/tasks';
  private readonly _taskParamsEndpoint = 'entities/task_params';
  private readonly _taskRequestsEndpoint = 'entities/task_requests';
  private readonly _dashboardAllDataEndpoint = 'entities/webapp_dashboard';
  private readonly _taskStatusDetailsEndpoint = 'entities/task_status_details';
  private readonly _dashboardActivitySummaryEndpoint = 'entities/portfolio_activity';

  constructor(
    private readonly fileService: FileService,
    private readonly userService: UserService,
    private readonly wsp: WebServiceProvider,
    private readonly sseStream: ServerSentEventsStreamService
  ) { }

  getDashboardData(
    startDate: Date = new Date(
      moment()
        .subtract(1, 'months')
        .format('MM-DD-YYYY')
    ),
    endDate: Date = new Date()
  ): Promise<DashboardBackend> {
    return this.wsp.getHttp<any[]>({
      endpoint: this._dashboardAllDataEndpoint,
      params: {
        filters: [
          {
            key: 'startdate',
            type: 'EQ',
            value: [
              moment(startDate)
                .format('MM/DD/YYYY')
                .toString()
            ]
          },
          {
            key: 'enddate',
            type: 'EQ',
            value: [
              moment(endDate)
                .format('MM/DD/YYYY')
                .toString()
            ]
          }
        ]
      }
    }).then(response => {
      const pnlSummary: PnlModel = this.getEntities(
        response,
        'returns',
        this.formatProfitAndLoss
      )[0];

      const actions: string[] = this.getEntities(
        response,
        'ai_recommendations',
        this.formatActions
      );

      const alerts = this.getEntities(
        response,
        'notifications',
        this.formatNotifications
      );

      const pnlAsset: PnlExposure[] = this.getEntitiesAssetPnl(
        response,
        this.formatPnlByAsset
      );

      const pnlSector: PnlExposure[] = this.getEntitiesSector(
        response,
        this.formatPnlBySector
      );

      const positionsAdded = this.getEntities(
        response,
        'positions_added',
        this.formatPositionsAdded
      );

      const positionsExited = this.getEntities(
        response,
        'positions_exited',
        this.formatPositionsAdded
      );

      const clientConnectivity = this.getEntities(
        response,
        'client_connectivity',
        this.formatClientConnectivity
      );

      const tasks = this.getEntities(
        response,
        'tasks',
        this.formatTasks
      );

      const task_statuses = this.getEntities(
        response,
        'task_status_details',
        this.formatTaskStatusDetail.bind(this)
      );

      const tasksIds = Array.from(new Set(tasks.map(t => t.id)));
      const task_params = this.getEntities(
        response,
        'task_params',
        this.formatTaskParam
      ).filter(item => tasksIds.includes(item.taskId));

      const fulfilledTasks = tasks.filter(task => task.frontEndIndicator).map((task): TaskObject => {
        const statusDetail = _.find(task_statuses, { taskId: task.id }),
          lastRunDetails = statusDetail ? statusDetail.lastRunDetails : null,
          params = _.filter(task_params, { taskId: task.id });
        return new TaskObject(
          lastRunDetails,
          params,
          statusDetail ? statusDetail.result : false,
          task
        );
      });

      return {
        pnl: pnlSummary,
        actions: actions,
        alerts: alerts,
        activitySummary: {
          pnlAssetType: pnlAsset,
          pnlSector: pnlSector,
          positionsAdded: positionsAdded,
          positionsExited: positionsExited
        },
        clientConnectivity,
        fulfilledTasks
      };
    });
  }

  getTaskObjects(): Promise<TaskObject[]> {
    return Promise.all([this.getTasks(), this.getTaskStatusDetails()])
      .then(result => {
        const [tasks, taskStatusDetails] = result;
        return Promise.all([
          tasks.filter(task => task.frontEndIndicator),
          this.getTaskParams(_.map(tasks, 'id')),
          taskStatusDetails
        ]);
      })
      .then(result => {
        const [tasks, taskParams, taskStatusDetails] = result;
        return tasks.map(task => {
          const statusDetail = _.find(taskStatusDetails, { taskId: task.id }),
            lastRunDetails = statusDetail ? statusDetail.lastRunDetails : null,
            params = _.filter(taskParams, { taskId: task.id });
          return new TaskObject(
            lastRunDetails,
            params,
            statusDetail ? statusDetail.result : false,
            task
          );
        });
      });
  }

  getTasks(): Promise<Task[]> {
    return this.wsp
      .getHttp<{
        category: string;
        description: string;
        frontendindicator: string;
        id: string;
        name: string;
      }[]>({
        endpoint: this._tasksEndpoint,
        params: {
          fields: ['id', 'name', 'description', 'category', 'frontendindicator']
        }
      })
      .then(tasks =>
          tasks.map(task => {
            const id = parseInt(task.id, 10);
            return new Task(
              task.category,
              task.description,
              task.frontendindicator === 'True',
              !isNaN(id) ? id : null,
              task.name
            );
          })
      );
  }

  runTask(task: TaskObject): Promise<any> {
    const params = task.params ? task.params : [];
    return Promise.all(params.map(param => this.getParamValue(param))).then(
      paramValues => {
        params.forEach((param, i) => (param.value = paramValues[i]));
        const inputParams = params
          .reduce(
            (paramString, param) =>
              `${paramString}${param.name}:${param.value},`,
            ''
          )
          .slice(0, -1);
        return this.postTaskRequest(
          inputParams,
          task.id,
          this.userService.getUser().id
        );
      }
    );
  }

  postTaskRequest(
    inputParams: string,
    taskId: number,
    userId: number
  ): Promise<any> {
    return this.wsp.postHttp<any>({
      endpoint: this._taskRequestsEndpoint,
      body: {
        inputParams,
        createdBy: userId.toString(),
        createdOn: moment().format('YYYY-MM-DD'),
        isScheduledTask: '0',
        taskId: taskId.toString()
      }
    });
  }

  subscribeToNotifications(): [Observable<AlertModel>, Observable<any>] {
    const notifications = new Subject<AlertModel>();
    const taskStatuses = new Subject<any>();

    this.sseStream.subToManyObjectStoreActions(
      environment.sseAppUrl,
      [EventEndpoint.NOTIFICATIONS, EventEndpoint.TASKS_STATUS],
      [EventActionType.ALL]
    ).subscribe(({ Endpoint: endpoint, Payload: payload }) => {
      switch (endpoint) {
        case EventEndpoint.NOTIFICATIONS: {
          notifications.next(this.formatNotifications({
            id: payload.Id,
            pnkl_type: 'notifications',
            clientid: payload.ClientId,
            rundatetime: payload.RunDatetime,
            notification: payload.Notification,
            notificationtype: payload.NotificationType,
            iso8601rundatetime: payload.ISO8601RunDateTime
          }));
          break;
        }
        case EventEndpoint.TASKS_STATUS: {
          taskStatuses.next(this.formatTaskStatusDetail(payload));
          break;
        }
      }
    });

    return [notifications.asObservable(), taskStatuses.asObservable()];
  }

  unsubscribeFromNotifications(): void {
    this.sseStream.unsubToManyObjectStoreActions(environment.sseAppUrl);
  }

  getActivitySummaryData(
    startDate: Date,
    endDate: Date
  ): Promise<ActivitySummaryModel> {
    return this.wsp.getHttp<any[]>({
      endpoint: this._dashboardActivitySummaryEndpoint,
      params: {
        filters: [
          {
            key: 'startdate',
            type: 'EQ',
            value: [
              moment(startDate)
                .format('MM/DD/YYYY')
                .toString()
            ]
          },
          {
            key: 'enddate',
            type: 'EQ',
            value: [
              moment(endDate)
                .format('MM/DD/YYYY')
                .toString()
            ]
          }
        ]
      }
    }).then(response => {
      const pnlAsset: PnlExposure[] = this.getEntitiesAssetPnl(
        response,
        this.formatPnlByAsset
      );

      const pnlSector: PnlExposure[] = this.getEntitiesSector(
        response,
        this.formatPnlBySector
      );

      const positionsAdded = this.getEntities(
        response,
        'positions_added',
        this.formatPositionsAdded
      );

      const positionsExited = this.getEntities(
        response,
        'positions_exited',
        this.formatPositionsAdded
      );

      return {
        pnlAssetType: pnlAsset,
        pnlSector: pnlSector,
        positionsAdded: positionsAdded,
        positionsExited: positionsExited
      };
    });
  }

  formatProfitAndLoss(entity: ProfitLossApiModel): PnlModel {
    return {
      daily: parseFloat(entity.dailyreturn),
      MTD: parseFloat(entity.mtdreturn),
      YTD: parseFloat(entity.ytdreturn)
    };
  }

  formatActions(entity: ActionApiModel): string {
    return entity.ai_recommendation;
  }

  formatNotifications(entity: AlertApiModel, isSSEDateFormat: boolean = false): AlertModel {
    const format = isSSEDateFormat ? 'YYYY-MM-DD HH:mm:ss a ZZ' : 'MM/DD/YYYY HH:mm:ss a ZZ';
    const runDateTimeMoment = moment(
      entity.iso8601rundatetime,
      format
    );
    const runDateTimeMomentIsValid = runDateTimeMoment.isValid();
    return {
      id: parseInt(entity.id, 10),
      clientId: parseInt(entity.clientid, 10),
      notificationType: parseInt(entity.notificationtype, 10),
      notification: entity.notification.replace(
        '{datetimeoffset}',
        runDateTimeMomentIsValid ? runDateTimeMoment.format('HH:mm') : null
      ),
      date: new Date(entity.rundatetime),
      isoDate: new Date(entity.iso8601rundatetime)
    };
  }

  formatPnlByAsset(entity: PnlByAssetApiModel): PnlExposure {
    return {
      type: entity.assettype,
      exposure: parseFloat(entity.exposurepct),
      change: parseFloat(entity.change)
    };
  }

  formatPnlBySector(entity: PnlBySectorApiModel): PnlExposure {
    return {
      type: entity.sector,
      exposure: parseFloat(entity.exposurepct),
      change: parseFloat(entity.change)
    };
  }

  formatPositionsAdded(entity: PositionEventApiModel): PositionEventModel {
    return {
      ticker: entity.ticker,
      position: parseFloat(entity.position),
      description: entity.description,
      direction: entity.direction
    };
  }

  formatClientConnectivity(entity: ClientConnectivityFromApi): ClientConnectivity {
    const adminId = parseInt(entity.adminid, 10),
      custodianId = parseInt(entity.custodianid, 10),
      id = parseInt(entity.id, 10);
    return new ClientConnectivity(
      !isNaN(adminId) ? adminId : null,
      !isNaN(custodianId) ? custodianId : null,
      entity.entity,
      entity.entitytype,
      !isNaN(id) ? id : null,
      entity.recon_indicator === 'True',
      entity.stockloan_indicator === 'True',
      entity.tradefile_indicator === 'True'
    );
  }

  formatTasks(task: {
    category: string;
    description: string;
    frontendindicator: string;
    id: string;
    name: string;
  }): Task {
    const id = parseInt(task.id, 10);
    return new Task(
      task.category,
      task.description,
      task.frontendindicator === 'True',
      !isNaN(id) ? id : null,
      task.name
    );
  }

  formatPositionsExited(entity: PositionEventApiModel): PositionEventModel {
    return {
      ticker: entity.ticker,
      position: parseFloat(entity.position),
      description: entity.description,
      direction: entity.direction
    };
  }

  private formatTaskParam(taskParam: {
    id: string;
    name: string;
    type: string;
    ostype: string;
    taskid: string;
    options: string;
    caption: string;
  }): TaskParam {
    const id = parseInt(taskParam.id, 10);
    const taskId = parseInt(taskParam.taskid, 10);
    const type = taskParam.type;
    const options = taskParam.options.length > 0
      ? taskParam.options.toUpperCase().split(',')
      : [];
    return new TaskParam(
      taskParam.caption,
      !isNaN(id) ? id : null,
      taskParam.name,
      options,
      taskParam.ostype,
      !isNaN(taskId) ? taskId : null,
      type,
      type === 'date' ? new Date() : undefined
    );
  }

  private getTaskStatusDetails(): Promise<TaskStatusDetail[]> {
    return this.wsp
      .getHttp<TaskStatusDetailFromApi[]>({
        endpoint: this._taskStatusDetailsEndpoint
      })
      .then((taskStatusDetails: TaskStatusDetailFromApi[]) =>
        taskStatusDetails.map(taskStatusDetail =>
          this.formatTaskStatusDetail(taskStatusDetail)
        )
      );
  }

  private getTaskParams(taskIds: number[]): Promise<TaskParam[]> {
    return this.wsp
      .getHttp<{
        caption: string;
        id: string;
        name: string;
        options: string;
        ostype: string;
        taskid: string;
        type: string;
      }[]>({
        endpoint: this._taskParamsEndpoint,
        params: {
          fields: ['taskid', 'name', 'caption', 'type', 'options', 'ostype'],
          filters: [
            {
              key: 'taskid',
              type: 'IN',
              value: taskIds.map(id => id.toString())
            }
          ]
        }
      })
      .then(taskParams => taskParams.map(this.formatTaskParam));
  }

  private formatTaskStatusDetail(
    taskStatusDetail: TaskStatusDetailFromApi
  ): TaskStatusDetail {
    const lastRunDetails = this.formatLastRunDetails(
      taskStatusDetail.lastrundetails
      ),
      taskId = parseInt(taskStatusDetail.taskid, 10);
    return new TaskStatusDetail(
      taskStatusDetail.heading,
      lastRunDetails,
      taskStatusDetail.result === '1',
      !isNaN(taskId) ? taskId : null
    );
  }

  private formatLastRunDetails(lastRunDetailsString: string): LastRunDetails {
    const lastRunDetails: {
        runbyfirstname: string;
        runbylastname: string;
        runby: string;
        runtime: string;
        taskinstancequeueid: string;
        taskrequestid: string;
        listofprops: any;
      } = JSON.parse(lastRunDetailsString),
      runtimeMoment = moment(
        lastRunDetails.runtime,
        'MM/DD/YYYY HH:mm:ss a ZZ'
      ),
      taskInstanceQueueId = parseInt(lastRunDetails.taskinstancequeueid, 10),
      taskRequestId = parseInt(lastRunDetails.taskrequestid, 10);
    const listOfProps = {};
    for (const key in lastRunDetails.listofprops) {
      // eslint-disable-next-line no-prototype-builtins
      if (lastRunDetails.listofprops.hasOwnProperty(key)) {
        const formattedKey = key
          .replace(/_/g, ' ')
          .replace(
            /\w\S*/g,
            txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          );
        listOfProps[formattedKey] = lastRunDetails.listofprops[key];
      }
    }
    return new LastRunDetails(
      listOfProps,
      lastRunDetails.runby,
      lastRunDetails.runbyfirstname,
      lastRunDetails.runbylastname,
      runtimeMoment.isValid() ? runtimeMoment.toDate() : null,
      !isNaN(taskInstanceQueueId) ? taskInstanceQueueId : null,
      !isNaN(taskRequestId) ? taskRequestId : null
    );
  }

  private getParamValue(param: TaskParam): Promise<any> {
    if (param.type !== 'file') {
      let value = param.value;
      if (param.type.toLowerCase() === 'date') {
        value = moment(value).format('MM/DD/YYYY');
      }
      return Promise.resolve(value);
    }
    const file: File = param.value.file;
    return this.fileService.upload({
      file,
      osType: param.osType
    });
  }

  private formatRecommendedAction(
    entityFromAPI: RecommendedActionFromApi
  ): RecommendedAction {
    const supressDate = moment.utc(
      entityFromAPI.actionsupressedat,
      'MM-DD-YYYY hh:mm:ss a'
    );
    const timeFrameEnd = moment.utc(
      entityFromAPI.timeframeend,
      'MM-DD-YYYY hh:mm:ss a'
    );
    const timeFrameStart = moment.utc(
      entityFromAPI.timeframestart,
      'MM-DD-YYYY hh:mm:ss a'
    );
    return {
      id: +entityFromAPI.id,
      dismissAfterProcessing: entityFromAPI.dismissafterprocessing === 'True',
      actionSupressedAt: supressDate.isValid() ? supressDate.toDate() : null,
      name: entityFromAPI.name,
      redirectURL: entityFromAPI.redirecturl,
      timeFrameEnd: timeFrameEnd.isValid() ? timeFrameEnd.toDate() : null,
      timeFrameStart: timeFrameStart.isValid() ? timeFrameStart.toDate() : null,
      webRequestMessage: entityFromAPI.webrequestmessage,
      webRequestAction: entityFromAPI.webrequestaction,
      actionType: entityFromAPI.recommendedactiontype
    } as RecommendedAction;
  }

  private getEntities(
    dynamicEntities: DynamicEntity[],
    pnkl_type: string,
    formatter: (entity: any) => any
  ): any[] {
    return chain(dynamicEntities)
      .filter({ pnkl_type })
      .map(entity => formatter(entity))
      .value();
  }

  private getEntitiesAssetPnl(
    dynamicEntities: DynamicEntity[],
    formatter: (entity: any) => any
  ): any[] {
    return chain(dynamicEntities)
      .filter(item => item.assettype && item.pnkl_type === 'activity_summary')
      .map((entity: PnlByAssetApiModel) => formatter(entity))
      .value();
  }

  private getEntitiesSector(
    dynamicEntities: DynamicEntity[],
    formatter: (entity: any) => any
  ): any[] {
    return chain(dynamicEntities)
      .filter(item => item.sector && item.pnkl_type === 'activity_summary')
      .map(entity => formatter(entity))
      .value();
  }
}
