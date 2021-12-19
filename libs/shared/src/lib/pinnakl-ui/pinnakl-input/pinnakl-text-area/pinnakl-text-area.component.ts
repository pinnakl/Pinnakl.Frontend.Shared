import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'pinnakl-text-area',
  templateUrl: './pinnakl-text-area.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PinnaklTextAreaComponent),
      multi: true
    }
  ]
})
export class PinnaklTextAreaComponent implements ControlValueAccessor {
  @Input() disableInput: boolean;
  @Input() inputClass: string;
  onChange: Function;
  value: string;

  registerOnChange(fn): void {
    this.onChange = fn;
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnTouched(fn): void {}

  valueChanged(body: any): void {
    this.onChange(body);
  }
}
