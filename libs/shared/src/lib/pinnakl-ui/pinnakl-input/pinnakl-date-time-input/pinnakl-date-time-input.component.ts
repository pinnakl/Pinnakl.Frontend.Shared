import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PinnaklDateType } from '../input-options.model';
import { PinnaklDateInputComponent } from '../pinnakl-date-input/pinnakl-date-input.component';
import { PinnaklDateInputHelper } from '../pinnakl-date-input/pinnakl-date-input.helper';

@Component({
  selector: 'pinnakl-date-time-input',
  templateUrl: './pinnakl-date-time-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PinnaklDateTimeInputComponent),
      multi: true
    }
  ]
})
export class PinnaklDateTimeInputComponent implements ControlValueAccessor {

  @Input() disableInput: boolean;
  @Input() inputClass: string;
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
