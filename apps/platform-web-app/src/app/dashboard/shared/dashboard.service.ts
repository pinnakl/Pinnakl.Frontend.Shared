import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { UserService } from '@pnkl-frontend/core';
import { SubscriptionResponse } from '@pnkl-frontend/core';
import { Account } from '@pnkl-frontend/shared';
import { FileService } from '@pnkl-frontend/shared';
import { BenchmarkComparison } from './benchmark-comparison.model';
import { LastRunDetails } from './last-run-details.model';
import { MonthlyReturn } from './monthly-return.model';
import { NotificationFromApi } from './notification-from-api.model';
import { Notification } from './notification.model';
import { Stats } from './stats.model';
import { TaskObject } from './task-object.model';
import { TaskParam } from './task-param.model';
import { TaskStatusDetailFromApi } from './task-status-detail-from-api.model';
import { TaskStatusDetail } from './task-status-detail.model';
import { Task } from './task.model';
import { TradeRequest } from './trade-request.model';

@Injectable()
export class DashboardService {
  private readonly BENCHMARK_COMPARISONS_RESOURCE_URL = 'benchmark_comparisons';
  private readonly NOTIFICATIONS_RESOURCE_URL = 'notifications';
  private readonly TASK_REQUESTS_RESOURCE_URL = 'task_requests';
  private readonly TASK_STATUS_DETAILS_RESOURCE_URL = 'task_status_details';

  constructor(
    private fileService: FileService,
    private userService: UserService,
    private wsp: WebServiceProvider
  ) {}

  getNotifications(): Promise<Notification[]> {
    const fields = [
      'id',
      'notificationtype',
      'notificationtypedescription',
      'notification',
      'iso8601rundatetime'
    ];
    const getWebRequest: GetWebRequest = {
      endPoint: this.NOTIFICATIONS_RESOURCE_URL,
      options: {
        fields,
        filters: [
          {
            key: '',
            type: 'TOP',
            value: ['20']
          }
        ],
        orderBy: [{ direction: 'DESC', field: 'iso8601rundatetime' }]
      }
    };
    return this.wsp
      .get(getWebRequest)
      .then((notifications: NotificationFromApi[]) =>
        notifications.map(notification => this.formatNotification(notification))
      );
  }

  getStatsData(accounts: Account[]): Promise<Stats> {
    const accountIds: number[] = accounts.map(account => parseInt(account.id));
    return Promise.all([
      this.getBenchmarkComparisons(accountIds),
      this.getMonthlyReturns(accountIds),
      this.getTradeRequests()
    ]).then(
      (result: [BenchmarkComparison[], MonthlyReturn[], TradeRequest[]]) => {
        let [benchmark, pnl, trades] = result;
        return this.formatStatsData(benchmark, pnl, trades);
      }
    );
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

  subscribeToNotificationsAndTaskStatusDetails(): [
    Observable<SubscriptionResponse<Notification>>,
    Observable<SubscriptionResponse<TaskStatusDetail>>
  ] {
    let [notificationObservable, taskStatusDetailObservable]: [
      Observable<SubscriptionResponse<NotificationFromApi>>,
      Observable<SubscriptionResponse<TaskStatusDetailFromApi>>
    ] = this.wsp.subscribeToMany([
      this.NOTIFICATIONS_RESOURCE_URL,
      this.TASK_STATUS_DETAILS_RESOURCE_URL
    ]) as any;
    return [
      notificationObservable.pipe(
        map((result: SubscriptionResponse<NotificationFromApi>) => {
          let response = new SubscriptionResponse<Notification>();
          response.action = result.action;
          response.body = this.formatNotification(result.body);
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
      )
    ];
  }

  subscribeToTaskStatusDetails(): Observable<
    SubscriptionResponse<TaskStatusDetail>
  > {
    return this.wsp.subscribe(this.TASK_STATUS_DETAILS_RESOURCE_URL).pipe(
      map((result: SubscriptionResponse<TaskStatusDetailFromApi>) => {
        let response = new SubscriptionResponse<TaskStatusDetail>();
        response.action = result.action;
        response.body = this.formatTaskStatusDetail(result.body);
        return response;
      })
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

  private formatNotification(notification: NotificationFromApi): Notification {
    let id = parseInt(notification.id),
      notificationType = parseInt(notification.notificationtype),
      runDateTimeMoment = moment(
        notification.iso8601rundatetime,
        'MM/DD/YYYY HH:mm:ss a ZZ'
      ),
      runDateTimeMomentIsValid = runDateTimeMoment.isValid(),
      runDateTime = runDateTimeMomentIsValid
        ? runDateTimeMoment.toDate()
        : null;
    return new Notification(
      !isNaN(id) ? id : null,
      notification.notification.replace(
        '{datetimeoffset}',
        runDateTimeMomentIsValid ? runDateTimeMoment.format('HH:mm') : null
      ),
      !isNaN(notificationType) ? notificationType : null,
      notification.notificationtypedescription,
      runDateTime
    );
  }

  private formatStatsData(
    benchmark: BenchmarkComparison[],
    pnl: MonthlyReturn[],
    trades: TradeRequest[]
  ): Stats {
    return new Stats(
      benchmark.length === 0 ? 0 : benchmark[0].alpha,
      pnl.length === 0 ? 0 : pnl[0].mtdReturn,
      trades.length,
      pnl.length === 0 ? 0 : pnl[0].ytdReturn
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

  private getBenchmarkComparisons(
    accountIds: number[]
  ): Promise<BenchmarkComparison[]> {
    const fields = ['alpha'],
      getWebRequest: GetWebRequest = {
        endPoint: this.BENCHMARK_COMPARISONS_RESOURCE_URL,
        options: {
          fields,
          filters: [
            {
              key: '',
              type: 'TOP',
              value: ['1']
            },
            {
              key: 'IsPrimaryAccountForReturns',
              type: 'EQ',
              value: ['1']
            },
            {
              key: 'IsPrimaryBenchmark',
              type: 'EQ',
              value: ['1']
            },
            {
              key: 'accountid',
              type: 'IN',
              value: accountIds.map(id => id.toString())
            }
          ],
          orderBy: [
            {
              direction: 'DESC',
              field: 'date'
            }
          ]
        }
      };
    return this.wsp
      .get(getWebRequest)
      .then((benchmarkComparisons: { alpha: string; id: string }[]) =>
        benchmarkComparisons.map(benchmarkComparison => {
          let alpha = parseFloat(benchmarkComparison.alpha),
            id = parseInt(benchmarkComparison.id);
          return new BenchmarkComparison(
            !isNaN(alpha) ? alpha : null,
            !isNaN(id) ? id : null
          );
        })
      );
  }

  private getMonthlyReturns(accountIds: number[]): Promise<MonthlyReturn[]> {
    const fields = ['accountid', 'mtdreturn', 'ytdreturn'];
    const getWebRequest: GetWebRequest = {
      endPoint: 'monthly_returns',
      options: {
        fields,
        filters: [
          {
            key: 'IsPrimaryForReturns',
            type: 'EQ',
            value: ['1']
          },
          {
            key: 'accountid',
            type: 'IN',
            value: accountIds.map(id => id.toString())
          },
          {
            key: '',
            type: 'TOP',
            value: ['1']
          }
        ],
        orderBy: [{ direction: 'DESC', field: 'date' }]
      }
    };
    return this.wsp
      .get(getWebRequest)
      .then(
        (
          monthlyReturns: {
            accountid: string;
            id: string;
            mtdreturn: string;
            ytdreturn: string;
          }[]
        ) =>
          monthlyReturns.map(monthlyReturn => {
            let accountId = parseInt(monthlyReturn.accountid),
              id = parseInt(monthlyReturn.id),
              mtdReturn = parseFloat(monthlyReturn.mtdreturn),
              ytdReturn = parseFloat(monthlyReturn.ytdreturn);
            return new MonthlyReturn(
              !isNaN(accountId) ? accountId : null,
              !isNaN(id) ? id : null,
              !isNaN(mtdReturn) ? mtdReturn : null,
              !isNaN(ytdReturn) ? ytdReturn : null
            );
          })
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
    let file: File = param.value.file;
    return this.fileService.upload({
      file,
      osType: param.osType
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

  private getTradeRequests(): Promise<TradeRequest[]> {
    const getWebRequest: GetWebRequest = {
      endPoint: 'trade_requests',
      options: {
        fields: ['id'],
        filters: [
          {
            key: 'tradedate',
            type: 'GE',
            value: [`1/1/${moment().format('YYYY')}`]
          }
        ]
      }
    };
    return this.wsp.get(getWebRequest).then((tradeRequests: { id: string }[]) =>
      tradeRequests.map(tradeRequest => {
        let id = parseInt(tradeRequest.id);
        return new TradeRequest(!isNaN(id) ? id : null);
      })
    );
  }
}
