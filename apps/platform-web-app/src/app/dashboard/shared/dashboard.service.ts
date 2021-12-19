import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WebServiceProvider } from '@pnkl-frontend/core';
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
  private readonly _tasksEndpoint = 'entities/tasks';
  private readonly _taskParamsEndpoint = 'entities/task_params';
  private readonly _taskRequestsEndpoint = 'entities/task_requests';
  private readonly _notificationsEndpoint = 'entities/notifications';
  private readonly _tradeRequestsEndpoint = 'entities/trade_requests';
  private readonly _monthlyReturnsEndpoint = 'entities/monthly_returns';
  private readonly _taskStatusDetailsEndpoint = 'entities/task_status_details';
  private readonly _benchmarkComparisonsEndpoint = 'entities/benchmark_comparisons';

  constructor(
    private fileService: FileService,
    private userService: UserService,
    private wsp: WebServiceProvider
  ) {}

  async getNotifications(): Promise<Notification[]> {
    const notifications = await this.wsp.getHttp<NotificationFromApi[]>({
      endpoint: this._notificationsEndpoint,
      params: {
        fields: [
          'id',
          'notificationtype',
          'notificationtypedescription',
          'notification',
          'iso8601rundatetime'
        ],
        filters: [
          {
            key: '',
            type: 'TOP',
            value: ['20']
          }
        ],
        orderBy: [{ direction: 'DESC', field: 'iso8601rundatetime' }]
      }
    });

    return notifications.map(this.formatNotification);
  }

  async getStatsData(accounts: Account[]): Promise<Stats> {
    const accountIds: number[] = accounts.map(account => parseInt(account.id, 10));
    const [benchmark, pnl, trades] = await Promise.all<BenchmarkComparison[], MonthlyReturn[], TradeRequest[]>([
      this.getBenchmarkComparisons(accountIds),
      this.getMonthlyReturns(accountIds),
      this.getTradeRequests()
    ]);

    return this.formatStatsData(benchmark, pnl, trades);
  }

  async getTaskObjects(): Promise<TaskObject[]> {
    const [tasks, taskStatusDetails] = await Promise.all([this.getTasks(), this.getTaskStatusDetails()]);

    const [filteredTasks, taskParams] = await Promise.all([
      tasks.filter(task => task.frontEndIndicator),
      this.getTaskParams(_.map(tasks, 'id'))
    ]);

    return filteredTasks.map(task => {
      const statusDetail = _.find(taskStatusDetails, { taskId: task.id });
      const lastRunDetails = statusDetail ? statusDetail.lastRunDetails : null;
      const params = _.filter(taskParams, { taskId: task.id });

      return new TaskObject(
        lastRunDetails,
        params,
        statusDetail ? statusDetail.result : false,
        task
      );
    });
  }

  async postTaskRequest(
    inputParams: string,
    taskId: number,
    userId: number
  ): Promise<any> {
    return this.wsp.postHttp({
      endpoint: this._taskRequestsEndpoint,
      body: {
        createdBy: userId,
        createdOn: moment().format('YYYY-MM-DD'),
        inputParams,
        isScheduledTask: 0,
        taskId
      }
    });
  }

  async runTask(task: TaskObject): Promise<any> {
    const params = task.params || [];
    const paramValues = await Promise.all(params.map(param => this.getParamValue(param)));

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

  subscribeToTaskStatusDetails(): Observable<
    SubscriptionResponse<TaskStatusDetail>
  > {
    return this.wsp.subscribe(this._taskStatusDetailsEndpoint).pipe(
      map((result: SubscriptionResponse<TaskStatusDetailFromApi>) => {
        const response = new SubscriptionResponse<TaskStatusDetail>();
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

  private formatNotification(notification: NotificationFromApi): Notification {
    const id = parseInt(notification.id),
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
    const lastRunDetails = this.formatLastRunDetails(
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

  private async getBenchmarkComparisons(
    accountIds: number[]
  ): Promise<BenchmarkComparison[]> {
    const benchmarkComparisons = await this.wsp.getHttp<{ alpha: string; id: string }[]>({
      endpoint: this._benchmarkComparisonsEndpoint,
      params: {
        fields: ['alpha'],
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
    });

    return benchmarkComparisons.map(benchmarkComparison => {
      const alpha = parseFloat(benchmarkComparison.alpha);
      const id = parseInt(benchmarkComparison.id, 10);
      return new BenchmarkComparison(
        !isNaN(alpha) ? alpha : null,
        !isNaN(id) ? id : null
      );
    });
  }

  private async getMonthlyReturns(accountIds: number[]): Promise<MonthlyReturn[]> {
    const monthlyReturns = await this.wsp.getHttp<{
      accountid: string;
      id: string;
      mtdreturn: string;
      ytdreturn: string;
    }[]>({
      endpoint: this._monthlyReturnsEndpoint,
      params: {
        fields: ['accountid', 'mtdreturn', 'ytdreturn'],
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
    });

    return monthlyReturns.map(monthlyReturn => {
      const id = parseInt(monthlyReturn.id, 10);
      const mtdReturn = parseFloat(monthlyReturn.mtdreturn);
      const ytdReturn = parseFloat(monthlyReturn.ytdreturn);
      const accountId = parseInt(monthlyReturn.accountid, 10);
      return new MonthlyReturn(
        !isNaN(accountId) ? accountId : null,
        !isNaN(id) ? id : null,
        !isNaN(mtdReturn) ? mtdReturn : null,
        !isNaN(ytdReturn) ? ytdReturn : null
      );
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
    return this.fileService.upload({
      file: param.value.file,
      osType: param.osType
    });
  }

  async getTasks(): Promise<Task[]> {
    const tasks = await this.wsp.getHttp<{
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
    });

    return tasks.map(task => {
      const id = parseInt(task.id, 10);
      return new Task(
        task.category,
        task.description,
        task.frontendindicator === 'True',
        !isNaN(id) ? id : null,
        task.name
      );
    });
  }

  private async getTaskParams(taskIds: number[]): Promise<TaskParam[]> {
    const taskParams = await this.wsp.getHttp<{
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
    });

    return taskParams.map(taskParam => {
      const id = parseInt(taskParam.id, 10);
      const taskId = parseInt(taskParam.taskid, 10);
      const type = taskParam.type;
      const options =
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
    });
  }

  private async getTaskStatusDetails(): Promise<TaskStatusDetail[]> {
    const taskStatusDetails = await this.wsp.getHttp<TaskStatusDetailFromApi[]>({
      endpoint: this._taskStatusDetailsEndpoint
    });

    return taskStatusDetails.map(this.formatTaskStatusDetail.bind(this));
  }

  private async getTradeRequests(): Promise<TradeRequest[]> {
    const tradeRequests = await this.wsp.getHttp<{ id: string }[]>({
      endpoint: this._tradeRequestsEndpoint,
      params: {
        fields: ['id'],
        filters: [
          {
            key: 'tradedate',
            type: 'GE',
            value: [`1/1/${moment().format('YYYY')}`]
          }
        ]
      }
    });

    return tradeRequests.map(tradeRequest => {
      const id = parseInt(tradeRequest.id, 10);
      return new TradeRequest(!isNaN(id) ? id : null);
    });
  }
}
