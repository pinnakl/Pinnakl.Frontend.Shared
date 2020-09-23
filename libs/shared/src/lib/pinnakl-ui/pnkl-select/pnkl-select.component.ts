import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'pnkl-select',
  templateUrl: 'pnkl-select.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PnklSelectComponent),
      multi: true
    }
  ]
})
export class PnklSelectComponent implements ControlValueAccessor, OnInit {
  @Input() allowCustom = false;
  @Input() label: string;
  @Input() modelProperty: string;
  @Input() options: any[];
  @Input() required: boolean;
  @Input() viewProperty: string;
  @Input()
  modelNormalizer: (textObservable: Observable<string>) => Observable<any>;
  selectedOption: any;
  propagateChange: any = () => {};
  ngOnInit() {
    // if (this.allowCustom && this.modelProperty && !this.modelNormalizer) {
    this.modelNormalizer = (textObservable: Observable<string>) =>
      textObservable.pipe(map((text: string) => text));
    // }
  }
  writeValue(value: any): void {
    this.selectedOption = value;
  }
  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }
  registerOnTouched(fn: any): void {}
  setDisabledState(isDisabled: boolean): void {}
  onValueChanged(value: any): void {
    if (!this.allowCustom) {
      this.selectedOption = value;
    }
    this.propagateChange(value);
  }
}
