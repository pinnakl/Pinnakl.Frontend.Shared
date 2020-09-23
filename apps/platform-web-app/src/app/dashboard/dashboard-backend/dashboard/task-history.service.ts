import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { TaskHistory } from '../../shared/task-history.model';

@Injectable()
export class TaskHistoryService {
  private TASK_HISTORY_URL = 'tasks_status';

  constructor(private wsp: WebServiceProvider) {}

  getTaskHistory(startDate: Date, taskId: string): Promise<TaskHistory[]> {
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
    const getWebRequest: GetWebRequest = {
      endPoint: this.TASK_HISTORY_URL,
      options: {
        fields,
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
    };
    return this.wsp.get(getWebRequest).then(taskHistoryRes => {
      return taskHistoryRes.map(x => {
        return new TaskHistory(
          x.failureparams,
          x.params,
          x.runby,
          new Date(x.runtime),
          x.status,
          x.successparams,
          x.taskinstancequeueid,
          x.taskrequestid
        );
      });
    });
  }
}
