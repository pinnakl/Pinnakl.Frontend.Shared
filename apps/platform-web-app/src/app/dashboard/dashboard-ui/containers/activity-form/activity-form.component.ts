import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'activity-form',
  templateUrl: './activity-form.component.html'
})
export class ActivityFormComponent implements OnInit {
  form: FormGroup;
  @Output()
  private refreshActivitySummary = new EventEmitter();
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      startDate: [
        new Date(
          moment()
            .subtract(1, 'months')
            .format('MM-DD-YYYY')
        )
      ],
      endDate: [new Date()]
    });
  }

  ngOnInit() {}

  fetchActivitySummaryData() {
    this.refreshActivitySummary.emit({
      startDate: this.form.controls.startDate.value,
      endDate: this.form.controls.endDate.value
    });
  }
}
