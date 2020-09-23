import { LastRunDetails } from './last-run-details.model';

export class TaskStatusDetail {
  constructor(
    public heading: string,
    public lastRunDetails: LastRunDetails,
    public result: boolean,
    public taskId: number
  ) {}
}
