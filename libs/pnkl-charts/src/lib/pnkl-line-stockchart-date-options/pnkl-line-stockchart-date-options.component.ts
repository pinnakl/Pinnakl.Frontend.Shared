import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

import { Subscription } from 'rxjs';

@Component({
  selector: 'pnkl-line-stockchart-date-options',
  templateUrl: './pnkl-line-stockchart-date-options.component.html',
  styleUrls: ['./pnkl-line-stockchart-date-options.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PnklLineStockchartDateOptionsComponent),
      multi: true
    }
  ]
})
export class PnklLineStockchartDateOptionsComponent
  implements OnInit, ControlValueAccessor, OnDestroy {
  @Input() selectionItems: string[] = [];
  @Input() hideSelected = false;
  @Input() hideDailyAndWeeklyOptions = false;
  @Input() hideAllOptions = false;
  formGroup: FormGroup;
  readonly frequencyOptions = [
    'Daily',
    'Weekly',
    'Monthly',
    'Quarterly',
    'Yearly'
  ];
  viewOptions: string[] = this.frequencyOptions;
  private changeSubscription: Subscription;
  constructor(private readonly fb: FormBuilder) {
    this.createForm();
  }

  ngOnInit(): void {
    if (this.hideDailyAndWeeklyOptions) {
      this.viewOptions = this.frequencyOptions.filter(opt => {
        return opt !== 'Daily' && opt !== 'Weekly';
      });
    }
    if(this.hideAllOptions) {
      this.viewOptions = [];
    }
  }

  ngOnDestroy(): void {
    this.changeSubscription.unsubscribe();
  }

  writeValue(obj: any): void {
    if (obj) {
      this.formGroup.patchValue(obj);
    }
  }
  registerOnChange(fn: any): void {
    this.changeSubscription = this.formGroup.valueChanges.subscribe(fn);
  }
  registerOnTouched(fn: any): void {}

  private createForm(): void {
    this.formGroup = this.fb.group({
      frequency: [],
      selectedItems: [[]]
    });
  }
}
