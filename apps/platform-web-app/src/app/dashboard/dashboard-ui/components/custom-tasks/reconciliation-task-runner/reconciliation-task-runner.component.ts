import { Component, Input } from '@angular/core';

import { ClientConnectivity } from '@pnkl-frontend/shared';
import { TaskRunnerComponent } from '../../../containers/task-runner/task-runner.component';
@Component({
  selector: 'reconciliation-task-runner',
  templateUrl: './reconciliation-task-runner.component.html',
  styleUrls: ['./reconciliation-task-runner.component.scss']
})
export class ReconciliationTaskRunnerComponent extends TaskRunnerComponent {
  @Input() entities: ClientConnectivity[];
}
