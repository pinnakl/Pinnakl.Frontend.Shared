import { Component, forwardRef, Input, OnDestroy } from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

import { Subscription } from 'rxjs';

@Component({
  selector: 'pnkl-line-chart-date-options',
  templateUrl: './pnkl-line-chart-date-options.component.html',
  styleUrls: ['./pnkl-line-chart-date-options.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PnklLineChartDateOptionsComponent),
      multi: true
    }
  ]
})
export class PnklLineChartDateOptionsComponent
  implements ControlValueAccessor, OnDestroy {
  @Input() selectionItems: string[] = [];
  @Input() hideSelected = false;
  formGroup: FormGroup;
  readonly frequencyOptions = [
    'Daily',
    'Weekly',
    'Monthly',
    'Quarterly',
    'Half Yearly',
    'Yearly'
  ];
  private changeSubscription: Subscription;
  constructor(private fb: FormBuilder) {
    this.createForm();
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
