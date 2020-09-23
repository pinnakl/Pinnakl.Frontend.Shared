import {
  Component,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

import { ComboBoxComponent } from '@progress/kendo-angular-dropdowns';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

import { Security } from '../../models/security/security.model';

type SelectorSecurity = Security & { searchString: string };

@Component({
  selector: 'security-selector',
  templateUrl: 'security-selector.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SecuritySelectorComponent),
      multi: true
    }
  ]
})
export class SecuritySelectorComponent
  implements ControlValueAccessor, OnChanges, OnDestroy, OnInit {
  comboBoxInstance: ComboBoxComponent;
  @Input() disabled = false;
  @Input() objectModel = false;
  @Input() required = false;
  @Input() securities: Security[];
  form: FormGroup;
  selectorSecurities: SelectorSecurity[];
  dropdownCollection: SelectorSecurity[];
  private dropdownValue: any;
  private dropdownValueSet = false;
  private securityChangedSubscription: Subscription;
  private propagateChange: any = () => {};

  constructor(private fb: FormBuilder) {}

  dropdownBlurred(comboBoxInstance: ComboBoxComponent): void {
    if (!this.comboBoxInstance) {
      this.comboBoxInstance = comboBoxInstance;
    }
    if (!this.dropdownValueSet || this.form.controls.security.value !== null) {
      return;
    }
    this.form.patchValue({ security: this.dropdownValue });
  }

  dropdownFocused(comboBoxInstance: ComboBoxComponent): void {
    if (this.disabled) {
      return;
    }
    if (!this.comboBoxInstance) {
      this.comboBoxInstance = comboBoxInstance;
    }
    this.dropdownValue = this.form.controls.security.value;
    // this.dropdownValueSet = true;
    // this.form.patchValue({ security: null });
    if (!this.comboBoxInstance.isOpen) {
      this.comboBoxInstance.toggle(true);
    }
  }

  filterDropdown(text: string): void {
    this.dropdownCollection = this.selectorSecurities.filter(security =>
      security.searchString.toLowerCase().includes(text.toLowerCase())
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes.securities;
    if (change) {
      if (!this.securities || this.securities.length === 0) {
        return;
      }
      this.selectorSecurities = _.cloneDeep(
        this.securities
      ) as SelectorSecurity[];
      for (const security of this.selectorSecurities) {
        let searchString = '';
        const {ticker, cusip, assetType} = security;
        if (assetType) {
          searchString += `${assetType} - `;
        }
        if (ticker) {
          searchString += `${ticker} - `;
        }
        if (cusip) {
          searchString += `${cusip} - `;
        }
        security.searchString = searchString + security.description;
      }
      this.dropdownCollection = this.selectorSecurities;
    }
  }

  ngOnDestroy(): void {
    this.securityChangedSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      security: []
    });
    this.securityChangedSubscription = this.form.controls.security.valueChanges.subscribe(
      (security: number | Security) => {
        if (!security) {
          return;
        }
        if (
          this.dropdownValueSet &&
          _.isEqual(this.dropdownValue, this.form.controls.security.value)
        ) {
          this.dropdownValue = null;
          this.dropdownValueSet = false;
          return;
        }
        this.propagateChange(security);
      }
    );
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  dropdownValueChanged(changedDropdownModelValue: any): void {
    if (changedDropdownModelValue == null) {
      this.comboBoxInstance.toggle(true);
    }
  }


  registerOnTouched(fn: any): void {}
  setDisabledState(isDisabled: boolean): void {}

  writeValue(security: number | Security): void {
    this.form.patchValue({ security });
  }
}
