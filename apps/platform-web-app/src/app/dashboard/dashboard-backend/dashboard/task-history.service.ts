import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { TaskHistory } from '../../shared/task-history.model';

@Injectable()
export class TaskHistoryService {
  private _taskStatusEndpoint = 'entities/tasks_status';

  constructor(private readonly wsp: WebServiceProvider) {}

  async getTaskHistory(
    startDate: Date,
    taskId: string
  ): Promise<TaskHistory[]> {
    const fields = [
      'runtime',
      'taskinstancequeueid',
      'runby',
      'status',
      'taskrequestid',
      'params',
      'successparams',
      'failureparams'
    ];

    const entities = await this.wsp.getHttp<any[]>({
      endpoint: this._taskStatusEndpoint,
      params: {
        fields: fields,
        filters: [
          {
            key: 'runtime',
            type: 'GE',
            value: [moment(startDate).format('MM/DD/YYYY')]
          },
          {
            key: 'taskid',
            type: 'EQ',
            value: [taskId.toString()]
          }
        ],
        orderBy: [{ direction: 'DESC', field: 'runtime' }]
      }
    });

    return entities.map(
      entity =>
        new TaskHistory(
          entity.failureparams,
          entity.params,
          entity.runby,
          new Date(entity.runtime),
          entity.status,
          entity.successparams,
          entity.taskinstancequeueid,
          entity.taskrequestid
        )
    );
  }
}
