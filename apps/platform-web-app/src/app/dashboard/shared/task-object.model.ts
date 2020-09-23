import { LastRunDetails } from './last-run-details.model';
import { TaskParam } from './task-param.model';
import { Task } from './task.model';

export class TaskObject extends Task {
  constructor(
    public lastRunDetails: LastRunDetails,
    public params: TaskParam[],
    public result: boolean,
    task: Task
  ) {
    super(
      task.category,
      task.description,
      task.frontEndIndicator,
      task.id,
      task.name
    );
  }
}
