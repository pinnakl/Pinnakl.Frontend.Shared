import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'pinnakl-editor',
  templateUrl: './pinnakl-editor.component.html',
  styleUrls: ['./pinnakl-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PinnaklEditorComponent),
      multi: true,
    }
  ]
})
export class PinnaklEditorComponent implements ControlValueAccessor {
  constructor() {}
  @Input() controlName: string;
  @Input() disableEditor: boolean;
  @Input() form: FormGroup;
  @Input() textEditorHeight = 500;

  onChange: Function;
  value: any;

  setInitParamsTextEditor(): any {
    let initParams = { branding: false, height: this.textEditorHeight };
    return initParams;
  }

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
