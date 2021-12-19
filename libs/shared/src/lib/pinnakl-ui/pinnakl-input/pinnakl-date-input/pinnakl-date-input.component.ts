import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PinnaklDateType } from '../input-options.model';
import { PinnaklDateInputHelper } from './pinnakl-date-input.helper';

@Component({
  selector: 'pinnakl-date-input',
  templateUrl: './pinnakl-date-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PinnaklDateInputComponent),
      multi: true
    }
  ]
})
export class PinnaklDateInputComponent implements ControlValueAccessor {
  @Input() disableInput: boolean;
  @Input() dateOptions: { format: string };
  @Input() inputClass: string;
  @Input() topView = 'month';
  @Input() bottomView = 'month';
  @Input() type: PinnaklDateType;
  onChange: Function;
  value: Date;
  helper = new PinnaklDateInputHelper();

  registerOnChange(fn): void {
    this.onChange = fn;
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnTouched(fn): void {}

  valueChanged(body: any): void {
    this.onChange(this.helper.inputTypePreformation(body, this.type));
  }
}
