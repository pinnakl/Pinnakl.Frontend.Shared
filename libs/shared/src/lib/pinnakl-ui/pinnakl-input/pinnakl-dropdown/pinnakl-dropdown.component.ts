import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ComboBoxComponent } from '@progress/kendo-angular-dropdowns';

@Component({
  selector: 'pinnakl-dropdown',
  templateUrl: './pinnakl-dropdown.component.html'
})
export class PinnaklDropdownComponent {
  comboBoxInstance: ComboBoxComponent;
  @Input() controlName: string;
  @Input() disabled: boolean;
  @Input()
  dropdownOptions: {
    allowCustom: boolean;
    isAsync: boolean;
    modelNormalizer: (textObservable: Observable<string>) => Observable<any>;
    modelProperty: string;
    objectModel: boolean;
    viewProperty: string;
  };
  dropdownCollection: any[];
  private _dropdownSource: any[];
  private dropdownValueSet = false;
  private dropdownValue: any;
  dropdownLoading: boolean;
  @Output() dropdownFetchData = new EventEmitter<void>();
  @Input() form: FormGroup;
  @Output() onDropdownValueChange = new EventEmitter<number>();
  @Input()
  set dropdownSource(dropdownSource: any[]) {
    this.dropdownCollection = this._dropdownSource = dropdownSource;
    if (!this.dropdownOptions || !this.dropdownOptions.isAsync) {
      return;
    }
    this.dropdownLoading = false;
    if (this.comboBoxInstance) {
      this.comboBoxInstance.toggle(true);
    }
  }

  get dropdownSource(): any[] {
    return this._dropdownSource;
  }

  constructor() {}

  dropdownFetchDataEmit(): void {
    this.dropdownFetchData.emit();
  }

  dropdownBlurred(comboBoxInstance: ComboBoxComponent): void {
    if (!this.comboBoxInstance) {
      this.comboBoxInstance = comboBoxInstance;
    }
    const formControlValue = this.form.controls[this.controlName].value;
    if (
      !this.dropdownValueSet ||
      (formControlValue !== null && formControlValue !== undefined)
    ) {
      return;
    }
    this.form.patchValue({ [this.controlName]: this.dropdownValue });
    this.dropdownValue = null;
    this.dropdownValueSet = false;
  }

  dropdownValueChanged(changedDropdownModelValue: any): void {
    this.onDropdownValueChange.emit(changedDropdownModelValue);
    if (this.comboBoxInstance && changedDropdownModelValue == null) {
      this.comboBoxInstance.toggle(true);
    }
  }

  filterDropdown(text: string): void {
    this.dropdownCollection = this._dropdownSource.filter(item => {
      const itemText: string =
        this.dropdownOptions && this.dropdownOptions.viewProperty
          ? item[this.dropdownOptions.viewProperty].toString()
          : item.toString();
      return itemText.toLowerCase().includes(text.toLowerCase());
    });
  }

  dropdownFocused(comboBoxInstance: ComboBoxComponent): void {
    if (this.disabled) {
      return;
    }
    if (!this.comboBoxInstance) {
      this.comboBoxInstance = comboBoxInstance;
    }
    this.dropdownValue = this.form.controls[this.controlName].value;
    // this.dropdownValueSet = true;
    // this.form.patchValue({ [this.controlName]: null });
    if (!this.comboBoxInstance.isOpen) {
      comboBoxInstance.open.emit();
    }
  }

  dropdownOpen(event: Event, comboBoxInstance: ComboBoxComponent): void {
    if (!this.comboBoxInstance) {
      this.comboBoxInstance = comboBoxInstance;
    }
    if (!this.dropdownOptions || !this.dropdownOptions.isAsync) {
      this.comboBoxInstance.toggle(true);
      return;
    }
    if (event) {
      event.preventDefault();
    }
    this.dropdownLoading = true;
    this.dropdownFetchData.emit();
  }

  defaultModelNormalizer(
    textObservable: Observable<string>
  ): Observable<string> {
    return textObservable.pipe(map((text: string) => text));
  }
}
