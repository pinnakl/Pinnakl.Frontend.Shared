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

import { SecurityService } from '../../pinnakl-web-services';
import { Security } from '../../models/security/security.model';
import { addAlpha, getCurrentSymbol } from '../security-items/security-item.util';
import { Router } from '@angular/router';

type SelectorSecurity = Security & { searchString: string };

@Component({
  selector: 'security-selector',
  styleUrls: ['security-selector.component.scss'],
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

  getCurrentSymbol = getCurrentSymbol;
  addAlpha = addAlpha;

  constructor(
    private readonly fb: FormBuilder,
    private readonly securityService: SecurityService,
    private readonly router: Router) {}
  comboBoxInstance: ComboBoxComponent;
  @Input() label = 'SECURITY';
  @Input() disabled = false;
  @Input() objectModel = false;
  @Input() required = false;
  @Input() securities: Security[];
  @Input() selectionStyle = 'Kendo'; // or PinnaklSecuritySelector
  @Input() assetType;
  form: FormGroup;
  selectorSecurities: SelectorSecurity[];
  dropdownCollection: SelectorSecurity[];
  private dropdownValue: any;
  private dropdownValueSet = false;
  private securityChangedSubscription: Subscription;
  colors = ['#ba68c8', '#ffb74d', '#4dd0e1', '#673ab7'];
  searchText = '';
  selectedItem;
  loadDebounceData = _.debounce(() => {
    this.securityService.getSecuritiesByText(this.searchText, this.assetType, [], this.router.url === '/ems').then((data: any) => {
      this.dropdownCollection = this.setParamsToData(data);
    });
  }, 300);
  private propagateChange: any = () => {};
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
    if (this.selectionStyle === 'Kendo') {
      this.dropdownCollection = this.selectorSecurities.filter(security =>
        security.searchString.toLowerCase().includes(text.toLowerCase())
      );
    } else {
      this.searchText = text;
      if (this.searchText.length > 1) {
        if(this.selectorSecurities?.length) {
          this.dropdownCollection = this.selectorSecurities.filter(security =>
            security.searchString.toLowerCase().includes(text.toLowerCase())
          );
        }
        this.loadDebounceData()
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.selectionStyle === 'Kendo') {
      const change = changes.securities;
      if (change) {
        this.dropdownCollection = this.setParamsToData(this.securities);
      }
    }
  }

  setParamsToData(securities) {
    if (!securities || securities.length === 0) {
      return [];
    }
    this.selectorSecurities = _.cloneDeep(
      securities
    ) as SelectorSecurity[];
    let i = 0;
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
      if (i === this.colors.length) {
        i = 0;
      }
      security['color'] = this.colors[i];
      i += 1;
      security.searchString = searchString + security.description;
    }
    return this.selectorSecurities;
  }

  ngOnDestroy(): void {
    this.comboBoxInstance?.togglePopup(false);
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
    if (this.form.controls.security.value) {
      this.selectItem(this.form.controls.security.value);
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  async selectItem(security) {
    const securityId = security.securityId;
    if (this.selectionStyle === 'PinnaklSecuritySelector') {
      security = await this.securityService.getSecurity(securityId);
    }
    if (security) {
      let searchString = '';
      const { ticker, cusip, assetType } = security;
      if (assetType) {
        searchString += `${assetType} - `;
      }
      if (ticker) {
        searchString += `${ticker} - `;
      }
      if (cusip) {
        searchString += `${cusip} - `;
      }
      this.searchText = searchString + security.description;
      security['id'] = securityId;
      this.selectedItem = security;
      this.form.patchValue({ security: this.selectedItem });
    }
  }

  clearSelected() {
    this.selectedItem = null;
    this.searchText = '';
    this.form.patchValue({ security: this.selectedItem });
  }

  dropdownValueChanged(changedDropdownModelValue: any): void {
    if (changedDropdownModelValue == null) {
      this.propagateChange(null);
      this.comboBoxInstance.toggle(true);
    } else if (this.selectionStyle === 'PinnaklSecuritySelector') {
      /**
       * for load security by id, for all data security item
       * its need for other logic after save tradeItem
       * earlier there was a query on which all securities were taken,
       * now there is another query on which we receive less data.
       * In order for other functionality to work in EMS,
       * we need all security fields, and this function makes a request to obtain this data
       */
      this.selectItem(changedDropdownModelValue);
    }
  }

  registerOnTouched(fn: any): void {}
  setDisabledState(isDisabled: boolean): void {}

  writeValue(security: number | Security): void {
    if (security && !this.dropdownCollection?.length) {
      this.dropdownCollection = this.setParamsToData([security]);
    }
    this.form.patchValue({ security });
  }

}
