import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import { ValueHistoryItem } from '../value-history-item.model';
import { ValueHistoryManagerService } from '../value-history-manager.service';

@Component({
  selector: 'value-history-item-form',
  templateUrl: './value-history-item-form.component.html',
  styleUrls: ['./value-history-item-form.component.scss']
})
export class ValueHistoryItemFormComponent implements OnInit {
  @Input() private set value(value: ValueHistoryItem) {
    this._existingValue = value;
    this.resetForm();
    if (value) {
      this.form.patchValue(value);
    }
  }
  @Output() private onSave = new EventEmitter<ValueHistoryItem>();

  form: FormGroup;
  submitted = false;
  private _existingValue: ValueHistoryItem;
  constructor(
    private fb: FormBuilder,
    private valueHistoryManagerService: ValueHistoryManagerService
  ) {
    this.createForm();
  }

  ngOnInit(): void {}

  onSubmit(): void {
    this.submitted = true;
    this.form.controls.endDate.updateValueAndValidity();
    if (!this.form.valid) {
      return;
    }
    this.onSave.emit({ ...this._existingValue, ...this.form.value });
    this.resetForm();
  }

  private createForm(): void {
    this.form = this.fb.group({
      endDate: [, this.validateEndDate.bind(this)],
      startDate: [],
      value: [, Validators.required]
    });
  }

  private resetForm(): void {
    this.form.reset();
    this.submitted = false;
  }

  private validateEndDate({ value: endDate }: FormControl): {} {
    if (!this.form) {
      return;
    }
    const { startDate } = this.form.value;
    return this.valueHistoryManagerService.validateValueDates(
      startDate,
      endDate
    );
  }
}
