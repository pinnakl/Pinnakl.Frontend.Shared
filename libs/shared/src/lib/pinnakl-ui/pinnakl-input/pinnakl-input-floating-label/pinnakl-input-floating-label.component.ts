import {
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputOptions } from '../input-options.model';

@Component({
  selector: 'pinnakl-input-floating-label',
  templateUrl: './pinnakl-input-floating-label.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PinnaklInputFloatingLabelComponent),
      multi: true
    }
  ]
})
export class PinnaklInputFloatingLabelComponent
  implements OnInit, ControlValueAccessor {
  applyActiveCss = false;
  @Input() class: string;
  @Input() disabledInput: boolean;
  private inputInActive = 'is-ready';
  private inputActiveCss = 'is-active is-completed';
  @Input() inputClass: string;
  @Input() inputOptions: InputOptions;
  @Input() label: string;
  @Input() required: boolean;
  labelAlignCss = '';
  @Input() type: string;
  @ViewChild('inputElement', { static: true }) inputElement: ElementRef;

  value: any;
  onChange: Function;

  constructor() {}

  registerOnChange(fn): void {
    this.onChange = fn;
  }

  writeValue(value: any): void {
    this.value = value;
    if (value) {
      this.applyActiveCss = true;
      this.labelAlignCss = this.inputInActive;
    }
  }

  registerOnTouched(fn): void {}

  inputFocused(): void {
    if (this.inputOptions && this.inputOptions.floatingLabel) {
      this.labelAlignCss = this.inputActiveCss;
      this.applyActiveCss = true;
    }
  }

  ngOnInit(): void {
    if (this.value) {
      this.applyActiveCss = true;
      this.labelAlignCss = this.inputInActive;
    }
  }

  inputFocusedOut(): void {
    if (this.inputOptions && this.inputOptions.floatingLabel) {
      if (this.value) {
        this.applyActiveCss = true;
        this.labelAlignCss = this.inputInActive;
      } else {
        this.applyActiveCss = false;
      }
    }
  }

  labelClicked(): void {
    if (!this.value) {
      this.inputElement.nativeElement.focus();
    }
  }

  valueChanged(val: any): void {
    this.onChange(val);
  }
}
