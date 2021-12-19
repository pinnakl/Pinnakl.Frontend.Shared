import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { InputOptions } from './input-options.model';

import { Place } from '../pinnakl-place-autocomplete/place.model';

@Component({
  selector: 'pinnakl-input',
  templateUrl: './pinnakl-input.component.html'
})
export class PinnaklInputComponent {
  private _checkBoxStyle: string;
  @Input() controlName: string;
  @Input()
  set checkBoxStyle(checkBoxStyle: string) {
    if (checkBoxStyle === 'toggle') {
      this._checkBoxStyle = 'toggle';
      this.toggleStyle.holder = 'slider round';
      this.toggleStyle.switch = 'switch';
    } else {
      this._checkBoxStyle = 'input-check';
    }
  }
  get checkBoxStyle(): string {
    return this._checkBoxStyle;
  }
  @Input() dateOptions: { format: string };
  @Input() decimals = 15;
  @Input() disabled = false;
  @Input() disableSelectAll: boolean;
  @Input() dropdownSource: any[];
  @Output() dropdownFetchData = new EventEmitter<void>();
  @Output() onDropdownValueChange = new EventEmitter<number>();
  @Input()
  dropdownOptions: {
    allowCustom?: boolean;
    isAsync?: boolean;
    clearButton?: boolean;
    modelNormalizer?: (textObservable: Observable<string>) => Observable<any>;
    modelProperty?: string;
    objectModel?: boolean;
    viewProperty?: string;
  };
  @Input() form: FormGroup | AbstractControl;
  @Input() format: string;
  @Input() hideLabel = false;
  @Input() inputClass: string;
  @Input() containerClass: string;
  @Input() showValidation = true;
  @Input() inputOptions: InputOptions;
  @Input() label: string;
  @Input() labelClass: string;
  @Output() placeDetailsReceived = new EventEmitter<Place>();
  @Output() onFilterValueChange = new EventEmitter<string>();
  @Input()
  placeOptions: {
    placeType: string;
    sendPlaceDetails: boolean;
    suggestionType: string;
  };
  @Input() required: boolean;
  @Input() textEditorHeight = 500;
  @Input() type: string;
  @Input() placeholder = '';
  @Input() textalign = 'left';
  @Input() value = false;
  @Input() topView = 'month';
  @Input() bottomView = 'month';
  toggleStyle = { holder: '', switch: '' };
  dropdownFetchDataEmit(): void {
    this.dropdownFetchData.emit();
  }

  dropdownValueChanged(changedDropdownModelValue: any): void {
    this.onDropdownValueChange.emit(changedDropdownModelValue);
  }

  filterValueChange(text: string) {
    this.onFilterValueChange.emit(text);
  }

  setCheckboxStyle(): string {
    return this.checkBoxStyle
      ? this.checkBoxStyle
      : (this.checkBoxStyle = 'input-check');
  }
}
