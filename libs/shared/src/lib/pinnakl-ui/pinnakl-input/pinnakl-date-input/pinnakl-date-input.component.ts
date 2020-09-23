import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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
export class PinnaklDateInputComponent implements OnInit, ControlValueAccessor {
  @Input() disableInput: boolean;
  @Input() dateOptions: { format: string };
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
