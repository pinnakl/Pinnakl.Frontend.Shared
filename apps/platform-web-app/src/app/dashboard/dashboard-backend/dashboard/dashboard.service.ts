import { Injectable } from '@angular/core';
import { DynamicEntity } from '@pnkl-frontend/shared';

import {
  ActionApiModel,
  ActivitySummaryModel,
  AlertApiModel,
  AlertModel,
  DashboardBackend,
  PnlByAssetApiModel,
  PnlBySectorApiModel,
  PnlExposure,
  PnlModel,
  PositionEventApiModel,
  PositionEventModel,
  ProfitLossApiModel
} from '../../dashboard-backend';
import { chain } from 'lodash';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { LastRunDetails } from '../../shared/last-run-details.model';
import { TaskObject } from '../../shared/task-object.model';
import { TaskParam } from '../../shared/task-param.model';
import { TaskStatusDetailFromApi } from '../../shared/task-status-detail-from-api.model';
import { TaskStatusDetail } from '../../shared/task-status-detail.model';
import { Task } from '../../shared/task.model';

import {
  GetWebRequest,
  SubscriptionResponse,
  WebServiceProvider
} from '@pnkl-frontend/core';
import { UserService } from '@pnkl-frontend/core';
import { FileService } from '@pnkl-frontend/shared';
import {
  RecommendedAction,
  RecommendedActionFromApi
} from '../recommended-actions';
@Injectable()
export class DashboardService {
  dashboard_allData = 'webapp_dashboard';
  dashboard_activitySummary = 'portfolio_activity';
  dashboard_ai_recommendations = 'dashboard_ai_recommendations';
  private readonly TASK_REQUESTS_RESOURCE_URL = 'task_requests';
  private readonly TASK_STATUS_DETAILS_RESOURCE_URL = 'task_status_details';
  constructor(
    private fileService: FileService,
    private userService: UserService,
    private wsp: WebServiceProvider
  ) {}

  getDashboardData(
    startDate: Date = new Date(
      moment()
        .subtract(1, 'months')
        .format('MM-DD-YYYY')
    ),
    endDate: Date = new Date()
  ): Promise<DashboardBackend> {
    const getWebRequest: GetWebRequest = {
      endPoint: this.dashboard_allData,
      options: {
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
    };
    return this.wsp.get(getWebRequest).then(response => {
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

      return {
        pnl: pnlSummary,
        actions: actions,
        alerts: alerts,
        activitySummary: {
          pnlAssetType: pnlAsset,
          pnlSector: pnlSector,
          positionsAdded: positionsAdded,
          positionsExited: positionsExited
        }
      };
    });
  }

  getTaskObjects(): Promise<TaskObject[]> {
    return Promise.all([this.getTasks(), this.getTaskStatusDetails()])
      .then(result => {
        let [tasks, taskStatusDetails] = result;
        return Promise.all([
          tasks.filter(task => task.frontEndIndicator),
          this.getTaskParams(_.map(tasks, 'id')),
          taskStatusDetails
        ]);
      })
      .then(result => {
        let [tasks, taskParams, taskStatusDetails] = result;
        return tasks.map(task => {
          let statusDetail = _.find(taskStatusDetails, { taskId: task.id }),
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
    const getWebRequest: GetWebRequest = {
      endPoint: 'tasks',
      options: {
        fields: ['id', 'name', 'description', 'category', 'frontendindicator']
      }
    };
    return this.wsp
      .get(getWebRequest)
      .then(
        (
          tasks: {
            category: string;
            description: string;
            frontendindicator: string;
            id: string;
            name: string;
          }[]
        ) =>
          tasks.map(task => {
            let id = parseInt(task.id);
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

  private getTaskStatusDetails(): Promise<TaskStatusDetail[]> {
    const getWebRequest: GetWebRequest = {
      endPoint: this.TASK_STATUS_DETAILS_RESOURCE_URL
    };
    return this.wsp
      .get(getWebRequest)
      .then((taskStatusDetails: TaskStatusDetailFromApi[]) =>
        taskStatusDetails.map(taskStatusDetail =>
          this.formatTaskStatusDetail(taskStatusDetail)
        )
      );
  }

  private getTaskParams(taskIds: number[]): Promise<TaskParam[]> {
    const getWebRequest: GetWebRequest = {
      endPoint: 'task_params',
      options: {
        fields: ['taskid', 'name', 'caption', 'type', 'options', 'ostype'],
        filters: [
          {
            key: 'taskid',
            type: 'IN',
            value: taskIds.map(id => id.toString())
          }
        ]
      }
    };
    return this.wsp
      .get(getWebRequest)
      .then(
        (
          taskParams: {
            caption: string;
            id: string;
            name: string;
            options: string;
            ostype: string;
            taskid: string;
            type: string;
          }[]
        ) =>
          taskParams.map(taskParam => {
            let id = parseInt(taskParam.id),
              taskId = parseInt(taskParam.taskid),
              type = taskParam.type,
              options =
                taskParam.options.length > 0
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
          })
      );
  }

  private formatTaskStatusDetail(
    taskStatusDetail: TaskStatusDetailFromApi
  ): TaskStatusDetail {
    let lastRunDetails = this.formatLastRunDetails(
        taskStatusDetail.lastrundetails
      ),
      taskId = parseInt(taskStatusDetail.taskid);
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
      taskInstanceQueueId = parseInt(lastRunDetails.taskinstancequeueid),
      taskRequestId = parseInt(lastRunDetails.taskrequestid);
    let listOfProps = {};
    for (let key in lastRunDetails.listofprops) {
      if (lastRunDetails.listofprops.hasOwnProperty(key)) {
        let formattedKey = key
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

  runTask(task: TaskObject): Promise<any> {
    let params = task.params ? task.params : [];
    return Promise.all(params.map(param => this.getParamValue(param))).then(
      paramValues => {
        params.forEach((param, i) => (param.value = paramValues[i]));
        let inputParams = '';
        inputParams = params
          .reduce(
            (paramString, param, i) =>
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
    let requestBody = {
      createdBy: userId,
      createdOn: moment().format('YYYY-MM-DD'),
      inputParams,
      isScheduledTask: 0,
      taskId
    };
    return this.wsp.post({
      endPoint: this.TASK_REQUESTS_RESOURCE_URL,
      payload: requestBody
    });
  }

  private getParamValue(param: TaskParam): Promise<any> {
    if (param.type !== 'file') {
      let value = param.value;
      if (param.type.toLowerCase() === 'date') {
        value = moment(value).format('MM/DD/YYYY');
      }
      return Promise.resolve(value);
    }
    let file: File = param.value.file;
    return this.fileService.upload({
      file,
      osType: param.osType
    });
  }

  subscribeToNotificationsAndTaskStatusDetailsAndRecommendedActions(): [
    Observable<SubscriptionResponse<AlertModel>>,
    Observable<SubscriptionResponse<TaskStatusDetail>>,
    Observable<SubscriptionResponse<RecommendedAction>>
  ] {
    let [
      notificationObservable,
      taskStatusDetailObservable,
      recommendedActionsObservable
    ]: [
      Observable<SubscriptionResponse<AlertApiModel>>,
      Observable<SubscriptionResponse<TaskStatusDetailFromApi>>,
      Observable<SubscriptionResponse<RecommendedActionFromApi>>
    ] = this.wsp.subscribeToMany([
      'notifications',
      'task_status_details',
      'recommended_actions'
    ]) as any;
    return [
      notificationObservable.pipe(
        map((result: SubscriptionResponse<AlertApiModel>) => {
          let response = new SubscriptionResponse<AlertModel>();
          response.action = result.action;
          response.body = this.formatNotifications(result.body);
          return response;
        })
      ),
      taskStatusDetailObservable.pipe(
        map((result: SubscriptionResponse<TaskStatusDetailFromApi>) => {
          let response = new SubscriptionResponse<TaskStatusDetail>();
          response.action = result.action;
          response.body = this.formatTaskStatusDetail(result.body);
          return response;
        })
      ),
      recommendedActionsObservable.pipe(
        filter(
          (result: SubscriptionResponse<RecommendedActionFromApi>) =>
            result.body.userid === this.userService.getUser().id.toString()
        ),
        map((result: SubscriptionResponse<RecommendedActionFromApi>) => {
          let response = new SubscriptionResponse<RecommendedAction>();
          response.action = result.action;
          response.body = this.formatRecommendedAction(result.body);
          return response;
        })
      )
    ];
  }

  subscribeToAlerts(): Observable<SubscriptionResponse<AlertModel>> {
    return this.wsp.subscribe('notifications').pipe(
      map((result: SubscriptionResponse<AlertApiModel>) => {
        let response = new SubscriptionResponse<AlertModel>();
        response.action = result.action;
        response.body = this.formatNotifications(result.body);
        return response;
      })
    );
  }

  subscribeToTasksStatus(): Observable<SubscriptionResponse<TaskStatusDetail>> {
    return this.wsp.subscribe('task_status_details').pipe(
      map((result: SubscriptionResponse<TaskStatusDetailFromApi>) => {
        let response = new SubscriptionResponse<TaskStatusDetail>();
        response.action = result.action;
        response.body = this.formatTaskStatusDetail(result.body);
        return response;
      })
    );
  }

  getActivitySummaryData(
    startDate: Date,
    endDate: Date
  ): Promise<ActivitySummaryModel> {
    const getWebRequest: GetWebRequest = {
      endPoint: this.dashboard_activitySummary,
      options: {
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
    };
    return this.wsp.get(getWebRequest).then(response => {
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
    const pnlSummary: PnlModel = {
      daily: parseFloat(entity.dailyreturn),
      MTD: parseFloat(entity.mtdreturn),
      YTD: parseFloat(entity.ytdreturn)
    };
    return pnlSummary;
  }

  formatActions(entity: ActionApiModel): string {
    return entity.ai_recommendation;
  }

  formatNotifications(entity: AlertApiModel): AlertModel {
    let runDateTimeMoment = moment(
      entity.iso8601rundatetime,
      'MM/DD/YYYY HH:mm:ss a ZZ'
    );
    let runDateTimeMomentIsValid = runDateTimeMoment.isValid();
    const alert: AlertModel = {
      id: parseInt(entity.id),
      clientId: parseInt(entity.clientid),
      notificationType: parseInt(entity.notificationtype),
      notification: entity.notification.replace(
        '{datetimeoffset}',
        runDateTimeMomentIsValid ? runDateTimeMoment.format('HH:mm') : null
      ),
      date: new Date(entity.rundatetime),
      isoDate: new Date(entity.iso8601rundatetime)
    };

    return alert;
  }

  formatPnlByAsset(entity: PnlByAssetApiModel): PnlExposure {
    const pnlAsset: PnlExposure = {
      type: entity.assettype,
      exposure: parseFloat(entity.exposurepct),
      change: parseFloat(entity.change)
    };

    return pnlAsset;
  }

  formatPnlBySector(entity: PnlBySectorApiModel): PnlExposure {
    const pnlAsset: PnlExposure = {
      type: entity.sector,
      exposure: parseFloat(entity.exposurepct),
      change: parseFloat(entity.change)
    };

    return pnlAsset;
  }

  formatPositionsAdded(entity: PositionEventApiModel): PositionEventModel {
    const positionAdded: PositionEventModel = {
      ticker: entity.ticker,
      position: parseFloat(entity.position),
      description: entity.description,
      direction: entity.direction
    };

    return positionAdded;
  }

  formatPositionsExited(entity: PositionEventApiModel): PositionEventModel {
    const positionExited: PositionEventModel = {
      ticker: entity.ticker,
      position: parseFloat(entity.position),
      description: entity.description,
      direction: entity.direction
    };

    return positionExited;
  }

  private formatRecommendedAction(
    entityFromAPI: RecommendedActionFromApi
  ): RecommendedAction {
    let supressDate = moment.utc(
      entityFromAPI.actionsupressedat,
      'MM-DD-YYYY hh:mm:ss a'
    );
    let timeFrameEnd = moment.utc(
      entityFromAPI.timeframeend,
      'MM-DD-YYYY hh:mm:ss a'
    );
    let timeFrameStart = moment.utc(
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
      .filter(item => {
        if (item.assettype && item.pnkl_type === 'activity_summary') {
          return true;
        }
        return false;
      })
      .map((entity: PnlByAssetApiModel) => formatter(entity))
      .value();
  }

  private getEntitiesSector(
    dynamicEntities: DynamicEntity[],
    formatter: (entity: any) => any
  ): any[] {
    return chain(dynamicEntities)
      .filter(item => {
        if (item.sector && item.pnkl_type === 'activity_summary') {
          return true;
        }
        return false;
      })
      .map(entity => formatter(entity))
      .value();
  }
}
