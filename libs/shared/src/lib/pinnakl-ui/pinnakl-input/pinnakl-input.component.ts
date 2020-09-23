import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
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
    modelNormalizer?: (textObservable: Observable<string>) => Observable<any>;
    modelProperty?: string;
    objectModel?: boolean;
    viewProperty?: string;
  };
  @Input() form: FormGroup;
  @Input() format: string;
  @Input() hideLabel = false;
  @Input() inputClass: string;
  @Input() showValidation = true;
  @Input() inputOptions: InputOptions;
  @Input() label: string;
  @Input() labelClass: string;
  @Output() placeDetailsReceived = new EventEmitter<Place>();
  @Input()
  placeOptions: {
    placeType: string;
    sendPlaceDetails: boolean;
    suggestionType: string;
  };
  @Input() required: boolean;
  @Input() textEditorHeight = 500;
  @Input() type: string;
  @Input() textalign = 'left';
  @Input() value = false;
  toggleStyle = { holder: '', switch: '' };
  dropdownFetchDataEmit(): void {
    this.dropdownFetchData.emit();
  }

  dropdownValueChanged(changedDropdownModelValue: any): void {
    this.onDropdownValueChange.emit(changedDropdownModelValue);
  }

  setCheckboxStyle(): string {
    return this.checkBoxStyle
      ? this.checkBoxStyle
      : (this.checkBoxStyle = 'input-check');
  }
}
