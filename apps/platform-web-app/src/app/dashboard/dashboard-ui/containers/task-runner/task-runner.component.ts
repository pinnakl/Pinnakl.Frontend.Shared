import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
    private toastr: Toastr
  ) {}

  ngOnInit(): void {
    this.setForm();
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (!form.valid) {
      return;
    }
    let { value: formValue } = form,
      parameters = this.task.params;
    if (parameters) {
      for (let parameter of parameters) {
        parameter.value = formValue[parameter.name];
      }
    }

    if (this.task && this.task.params) {
      let fileParam = this.task.params.find(x => x.name === 'file');
      if (fileParam && fileParam.value.file.size <= 0) {
        this.toastr.error('File cannot be empty');
        return;
      }
    }
    this.spinner.spin();
    this.dashboardService
      .runTask(this.task)
      .then(() => {
        this.spinner.stop();
        this.taskRunCompleted.emit();
      })
      .catch(() => this.spinner.stop());
    this.form.reset();
  }

  private setForm(): void {
    let group = {},
      parameters = this.task.params;
    if (parameters) {
      for (let parameter of parameters) {
        group[parameter.name] = new FormControl(
          parameter.value,
          Validators.required
        );
      }
    }
    this.form = new FormGroup(group);
  }
}
