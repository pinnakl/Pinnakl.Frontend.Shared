import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { DashboardService } from '../../../dashboard-backend/dashboard/dashboard.service';
import { TaskObject } from '../../../shared/task-object.model';

@Component({
  selector: 'task-runner',
  templateUrl: 'task-runner.component.html'
})
export class TaskRunnerComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  @Input() task: TaskObject;
  @Output() private taskRunCompleted = new EventEmitter<void>();

  constructor(
    private dashboardService: DashboardService,
    private spinner: PinnaklSpinner,
    private toastr: Toastr,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setForm();
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (!form.valid) {
      return;
    }

    const { value: formValue } = form;
    const parameters = this.task?.params || [];
    if (parameters) {
      for (const parameter of parameters) {
        parameter.value = formValue[parameter.name];
      }
    }

    if (this.task && this.task.params) {
      const fileParam = this.task.params.find(x => x.name === 'file');
      if (fileParam && fileParam.value.file.size <= 0) {
        this.toastr.error('File cannot be empty');
        return;
      }
    }
    this.spinner.spin();
    this.form.reset();
    this.cd.detectChanges();
    this.dashboardService
      .runTask(this.task)
      .then(() => {
        this.taskRunCompleted.emit();
        this.spinner.stop();
      })
      .catch(() => this.spinner.stop());
  }

  private setForm(): void {
    const group = {};
    const parameters = this.task.params;
    if (parameters) {
      for (const parameter of parameters) {
        group[parameter.name] = new FormControl(
          parameter.value,
          Validators.required
        );
      }
    }
    this.form = new FormGroup(group);
  }
}
