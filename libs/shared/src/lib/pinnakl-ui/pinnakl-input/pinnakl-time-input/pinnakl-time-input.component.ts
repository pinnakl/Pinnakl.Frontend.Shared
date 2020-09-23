import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'pinnakl-time-input',
  templateUrl: './pinnakl-time-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PinnaklTimeInputComponent),
      multi: true
    }
  ]
})
export class PinnaklTimeInputComponent implements OnInit, ControlValueAccessor {
  @Input() disableInput: boolean;
  @Input() format = 'HH:mm:ss';
  @Input() inputClass: string;
  onChange: Function;
  value: Date;
  constructor() {}

  ngOnInit(): void {}
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
