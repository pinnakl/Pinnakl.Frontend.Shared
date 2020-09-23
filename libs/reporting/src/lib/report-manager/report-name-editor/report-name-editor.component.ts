import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

@Component({
  selector: 'report-name-editor',
  templateUrl: 'report-name-editor.component.html'
})
export class ReportNameEditorComponent implements OnInit {
  @Input()
  set reportName(reportName: string) {
    this._reportName = reportName;
    setTimeout(() => this.form.patchValue({ reportName }));
  }

  @Output() nameUpdated = new EventEmitter<string>();

  actionsVisible = false;
  form: FormGroup;
  submitted = false;

  private _reportName = '';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      reportName: [
        '',
        [Validators.required, this.validateReportName.bind(this)]
      ]
    });
  }

  resetForm(): void {
    this.form.reset();
    this.form.patchValue({ reportName: this._reportName });
  }

  submit(): void {
    this.submitted = true;
    if (!this.form.valid) {
      return;
    }
    this.nameUpdated.emit(this.form.value.reportName);
  }

  private validateReportName(reportName: FormControl): {} {
    return reportName.value !== this._reportName
      ? null
      : {
          validateReportName: {
            errorMessage: 'Report name not updated'
          }
        };
  }
}
