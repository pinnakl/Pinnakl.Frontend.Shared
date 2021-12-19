import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Account, ChartTypes, PositionsPnlDataField, Utility } from '@pnkl-frontend/shared';
import * as moment from 'moment';
import {
  DataTypes,
  PnlCalculatedTimeseriesFilter
} from '../../shared/pnl-backend/pnl-calculated-timeseries/pnl-calculated-timeseries-filter.model';

@Component({
  selector: 'pnl-calculated-timeseries-filter',
  templateUrl: './pnl-calculated-timeseries-filter.component.html',
  styleUrls: ['./pnl-calculated-timeseries-filter.component.scss']
})
export class PnlCalculatedTimeseriesFilterComponent implements OnInit {
  @Input() accounts: Account[] = [];
  @Input() pnlFields: PositionsPnlDataField[] = [];

  @Input() set pnlCalculatedTimeseriesFilter(
    value: PnlCalculatedTimeseriesFilter
  ) {
    if (value) {
      const dataType = value.dataType || DataTypes.TOTAL;
      const chartType = value.chartType || ChartTypes.BAR;
      this.setFormValue({
        ...value,
        dataType,
        chartType,
        groupingKey: this.pnlFields.find(field => field.name === value.groupingKey.name),
        accountId: <any>value.accountId.toString()
      });
    }
  }
  @Output() onFilterChanged = new EventEmitter<PnlCalculatedTimeseriesFilter>();
  @Output() onDataTypeChanged = new EventEmitter<DataTypes>();

  get isTotal(): boolean {
    return this.formGroup.controls['dataType'].value === DataTypes.TOTAL;
  }

  formGroup: FormGroup;
  submitted = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly utils: Utility
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.formGroup.controls['dataType'].valueChanges.subscribe((dataType: any) => {
      console.log({dataType});
      this.onDataTypeChanged.emit(dataType);
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.formGroup.valid) {
      return;
    }
    if (this.formGroup.controls['dataType'].value === DataTypes.TOTAL) {
      this.formGroup.controls['groupingKey'].setValue({
        name: 'Analyst', type: 'attribute'
      });
    }
    this.onFilterChanged.emit({
      ...this.formGroup.value,
      accountId: +this.formGroup.value.accountId
    });
  }

  private createForm(): void {
    const prevBusinessDay = this.utils.getPreviousBusinessDay();
    this.formGroup = this.fb.group({
      accountId: [, Validators.required],
      endDate: [prevBusinessDay, Validators.required],
      dataType: [DataTypes.TOTAL, Validators.required],
      chartType: [ChartTypes.LINE, Validators.required],
      groupingKey: [, Validators.required],
      startDate: [
        moment(prevBusinessDay)
          .subtract(30, 'd')
          .toDate(),
        Validators.required
      ]
    });
  }

  private setFormValue(value: PnlCalculatedTimeseriesFilter): void {
    this.submitted = false;
    this.formGroup.reset();
    this.formGroup.patchValue(value);
  }
}
