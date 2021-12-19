import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComboBoxComponent } from '@progress/kendo-angular-dropdowns';
import _, { debounce } from 'lodash';
import { Subscription } from 'rxjs';
import { UniveralSearchService } from '../../services/universal-search.service';

@Component({
  selector: 'linked-contact-selection',
  templateUrl: './linked-contact-selection.component.html',
  styleUrls: ['./linked-contact-selection.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LinkedContactSelectionComponent),
      multi: true
    }
  ]
})

export class LinkedContactSelectionComponent implements ControlValueAccessor, OnDestroy, OnInit {

  constructor(private readonly fb: FormBuilder, private readonly univeralSearchService: UniveralSearchService) { }
  comboBoxInstance: ComboBoxComponent;
  @Input() label = 'ADD PORTAL USER';
  @Input() disabled = false;
  @Input() objectModel = false;
  @Input() required = false;
  @Input() multi = false;
  form: FormGroup;
  selectorContacts: any[];
  dropdownCollection: any[];
  private dropdownValue: any;
  private dropdownValueSet = false;
  private contactChangedSubscription: Subscription;
  colors = ['#ba68c8', '#ffb74d', '#4dd0e1', '#673ab7'];
  searchText = '';
  selectedItem;
  loadDebounceData = debounce(() => {
    this.univeralSearchService.getSearchOrganization(this.searchText, 'contact').then((data: any) => {
      const responseData = data.map(el => {
        return JSON.parse(el.Result);
      })
      this.dropdownCollection = this.setParamsToData(responseData);
    });
  }, 300);
  private propagateChange: any = () => { };

  filterDropdown(text: string): void {

    this.searchText = text;
    if (this.searchText.length > 2) {
      if (this.selectorContacts?.length) {
        this.dropdownCollection = this.selectorContacts.filter(contact =>
          contact.Name.toLowerCase().includes(text.toLowerCase())
        );
      }
      this.loadDebounceData()
    }
  }
  setParamsToData(contacts) {
    if (!contacts || contacts.length === 0) {
      return [];
    }
    this.selectorContacts = _.cloneDeep(
      contacts
    ) as any[];
    let i = 0;
    for (const contact of this.selectorContacts) {
      contact['idx'] = 0;
      contact['color'] = this.colors[i];
      i += 1;
    }
    this.selectorContacts[0]['idx'] = 1;
    return this.selectorContacts;
  }

  ngOnDestroy(): void {
    this.comboBoxInstance?.togglePopup(false);
    this.contactChangedSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      contact: []
    });
    this.contactChangedSubscription = this.form.controls.contact.valueChanges.subscribe(
      (contact: number) => {
        if (!contact) {
          return;
        }
        if (
          this.dropdownValueSet &&
          _.isEqual(this.dropdownValue, this.form.controls.contact.value)
        ) {
          this.dropdownValue = null;
          this.dropdownValueSet = false;
          return;
        }
        this.propagateChange(contact);
      }
    );
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  clearSelected() {
    this.selectedItem = null;
    this.searchText = '';
    this.form.patchValue({ contact: this.selectedItem });
  }

  dropdownValueChanged(changedDropdownModelValue: any): void {
    if (changedDropdownModelValue == null) {
      this.propagateChange(null);
      this.comboBoxInstance?.toggle(true);
    }
  }

  registerOnTouched(fn: any): void { }
  setDisabledState(isDisabled: boolean): void { }

  writeValue(contact: number): void {
    if (contact && !this.dropdownCollection?.length) {
      this.dropdownCollection = this.setParamsToData([contact]);
    }
    this.form.patchValue({ contact });
  }

  getCurrentSymbol(text: string): string {
    const arrNames = text?.split(' ');
    if (!arrNames) {
      return '';
    }
    const symbols = arrNames.length > 1 ? arrNames[0][0]?.toUpperCase() + arrNames[1][0]?.toUpperCase() : arrNames[0][0]?.toUpperCase();
    return text?.length ? symbols : '-';
  }

  addAlpha(color: string, opacity: number = 0.4): string {
    const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
  }
  getParent(e, idx) {
    if (idx === 1 && e?.parentElement) {
      e.parentElement.style['margin-top'] = '12px';
    }
    return '0px';
  }

  handleValue(selected) {
    if (!this.multi && selected.length >= 1) {
      this.form.get('contact').setValue([selected[selected.length -1]])
    }
  }
}
