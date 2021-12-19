import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { cloneDeep, includes, map, remove } from 'lodash';

import { ComboBoxComponent } from '@progress/kendo-angular-dropdowns';
import { Observable } from 'rxjs';

@Component({
  selector: 'pnkl-multiselect-dropdown',
  templateUrl: './pnkl-multiselect-dropdown.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PnklMultiselectDropdownComponent),
      multi: true
    }
  ]
})
export class PnklMultiselectDropdownComponent
  implements ControlValueAccessor, OnChanges {
  private _dropdownSource: any[];
  @Input() controlName: string;
  @Input() disabled: boolean;
  @Input() inputClass: string;
  dropdownCollection: any[];
  dropdownLoading: boolean;
  comboBoxInstance: ComboBoxComponent;
  @Input()
  dropdownOptions: {
    allowCustom: boolean;
    disableSelectAll: boolean;
    isAsync: boolean;
    modelNormalizer: (textObservable: Observable<string>) => Observable<any>;
    modelProperty: string;
    objectModel: boolean;
    viewProperty: string;
  };
  @Output() dropdownFetchData = new EventEmitter<void>();
  @Output() onDropdownValueChange = new EventEmitter<number>();
  selectedValue: any[] = [];

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

  @Input()
  set dropdownSource(dropdownSource: any[]) {
    if (dropdownSource) {
      this.dropdownCollection = this._dropdownSource = [...dropdownSource];
    } else {
      this.dropdownCollection = this._dropdownSource = [];
    }

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

  filterDropdown(text: string): void {
    this.dropdownCollection = this._dropdownSource.filter(item => {
      let itemText: string =
        this.dropdownOptions && this.dropdownOptions.viewProperty
          ? item[this.dropdownOptions.viewProperty].toString()
          : item.toString();
      return itemText.toLowerCase().includes(text.toLowerCase());
    });
  }

  public onValueChange(value: any): void {
    if (this.dropdownOptions && this.dropdownOptions.disableSelectAll) {
      this.selectedValue = value;
      this.propagateChange(value);
      return;
    }
    this.onDropdownValueChange.emit(value);

    if (
      this.dropdownOptions &&
      this.dropdownOptions.modelProperty &&
      this.dropdownOptions.modelProperty !== 'id'
    ) {
      if (includes(value, 'ALL')) {
        this.selectedValue = ['ALL'];
        let allValues = map(
          this.dropdownCollection,
          item => item[this.dropdownOptions.viewProperty]
        );
        remove(allValues, item => {
          return item === 'ALL';
        });
        this.propagateChange(allValues);
      } else {
        this.selectedValue = value;
        this.propagateChange(value);
      }
    } else if (
      this.dropdownOptions &&
      ((!this.dropdownOptions.objectModel &&
        this.dropdownOptions.viewProperty) ||
        this.dropdownOptions.modelProperty === 'id')
    ) {
      if (includes(value, -1)) {
        this.selectedValue = [-1];
        let allValues = map(this.dropdownCollection, item => item.id);
        remove(allValues, item => {
          return item === -1;
        });
        this.propagateChange(allValues);
      } else {
        this.selectedValue = value;
        this.propagateChange(value);
      }
    } else if (this.dropdownOptions && this.dropdownOptions.objectModel) {
      let allObjectSelected = false;
      let allObject;
      value.forEach(item => {
        if (item[this.dropdownOptions.viewProperty] === 'ALL') {
          allObjectSelected = true;
          allObject = item;
        }
      });
      if (allObjectSelected) {
        this.selectedValue = [allObject];
        let allValues = cloneDeep(this.dropdownCollection);
        remove(allValues, item => {
          return item[this.dropdownOptions.viewProperty] === 'ALL';
        });
        this.propagateChange(allValues);
      } else {
        this.selectedValue = value;
        this.propagateChange(value);
      }
    } else {
      if (includes(value, 'ALL')) {
        this.selectedValue = ['ALL'];
        let allValues: any[] = map(this.dropdownCollection, item => item);
        remove(allValues, item => {
          return item === 'ALL';
        });
        this.propagateChange(allValues);
      } else {
        this.selectedValue = value;
        this.propagateChange(value);
      }

    }
  }

  initializeSource(): void {
    if (
      this.dropdownOptions &&
      !this.dropdownOptions.disableSelectAll &&
      this.dropdownCollection
    ) {
      if (this.dropdownOptions && this.dropdownOptions.viewProperty) {
        let allObject = {
          id: -1
        };
        allObject[this.dropdownOptions.viewProperty] = 'ALL';
        if (
          this.dropdownCollection[0] &&
          this.dropdownCollection[0].id !== -1
        ) {
          this.dropdownCollection.unshift(allObject);
        }
      } else {
        if (this.dropdownCollection[0] !== 'ALL') {
          this.dropdownCollection.unshift('ALL');
        }
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.dropdownSource && changes.dropdownSource.currentValue) {
      this.initializeSource();
    }
  }

  writeValue(value: any): void {
    this.selectedValue = value;
  }

  propagateChange: any = () => {};

  registerOnChange(fn: any): void {
    // this is the handler function we want to call whenever counterValue changes through the view.
    this.propagateChange = fn;
  }

  registerOnTouched(): void {}
}
