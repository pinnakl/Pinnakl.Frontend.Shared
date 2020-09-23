import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { PinnaklFileInput } from './pinnakl-file-input.model';
@Component({
  selector: 'file-input',
  template: `
    <input type="file" (change)="onValueChanged($event)" class="pnkl-input" />
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileInputComponent),
      multi: true
    }
  ]
})
export class FileInputComponent implements ControlValueAccessor {
  propagateChange: any = () => {};
  writeValue(value: any): void {}
  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }
  registerOnTouched(fn: any): void {}
  setDisabledState(isDisabled: boolean): void {}
  onValueChanged(event: Event): void {
    const target = event.target as HTMLInputElement,
      fileDefinition = target.files[0];
    if (!fileDefinition) {
      this.propagateChange();
      return;
    }
    const reader = new FileReader();
    reader.onload = loadEvent => {
      this.propagateChange(
        new PinnaklFileInput(<string>reader.result, fileDefinition)
      );
    };
    reader.readAsDataURL(fileDefinition);
  }
}
