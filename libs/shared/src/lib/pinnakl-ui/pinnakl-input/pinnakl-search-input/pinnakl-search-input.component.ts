import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
@Component({
  selector: 'pinnakl-search-input',
  templateUrl: './pinnakl-search-input.component.html',
  styleUrls: ['./pinnakl-search-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PinnaklSearchInputComponent),
      multi: true
    }
  ]
})
export class PinnaklSearchInputComponent implements ControlValueAccessor {
  @Input() darkMode = false;
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
