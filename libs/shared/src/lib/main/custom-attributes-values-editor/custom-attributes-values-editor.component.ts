import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import { CustomAttributeMappingTable } from '../../models/custom-attributes-feature.model';

import { PinnaklSpinner, Toastr } from '@pnkl-frontend/core';
import { reduce } from 'lodash';
import { CustomAttribute, CustomAttributeFeature, CustomAttributeValue, CustomAttributeWithValue } from '../../models';
import { CustomAttributesService } from '../../pinnakl-web-services/security/custom-attributes.service';
import { Utility } from '../../services/utility.service';
// import { SecuritiesHelper } from '../shared/securities-helper.service';

export interface EntityTypes {
  securityId: number;
  investorId: number;
}

export type EntityKeys = keyof EntityTypes;

export interface Entity {
  id: number;
}

@Component({
  selector: 'app-custom-attributes-values-editor',
  templateUrl: 'custom-attributes-values-editor.component.html',
  styleUrls: ['./custom-attributes-values-editor.component.scss']
})
export class CustomAttributesValuesEditorComponent implements OnInit, OnChanges {
  @Input() entity: Entity = {} as Entity;
  @Input() entityKey: EntityKeys = 'securityId';
  @Input() customAttributes: CustomAttribute[];
  @Input() customAttributeValues: CustomAttributeValue[];
  @Input() showOnlyForm: boolean;
  @Input() featureName = CustomAttributeFeature.SECURITY;

  @Output() update = new EventEmitter<CustomAttributeWithValue[]>();

  private helper: any;
  private customAttributesWithValue: CustomAttributeWithValue[];
  confirmationVisible = false;
  form: FormGroup;
  hideManageAttributesModal = true;

  constructor(
    private readonly customAttributesService: CustomAttributesService,
    private readonly fb: FormBuilder,
    private readonly pinnaklSpinner: PinnaklSpinner,
    private readonly toastr: Toastr,
    private readonly utility: Utility
  ) { }

  ngOnInit(): void {
    this.init();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customAttributes']) {
      this.init();
    }
  }

  init(): void {
    this.addValueToCustomAttributes();
    this.initializeForm();
  }

  hideConfirmation(): void {
    this.confirmationVisible = false;
  }

  getType(type: string): string {
    switch (type) {
      case 'Checkbox':
        return 'boolean';
      case 'Date':
        return 'date';
      case 'Number':
        return 'numeric';
      case 'List':
        return 'dropdown';
      case 'Text':
        return 'text';
      case 'Url':
        return 'text';
      default:
        return type;
    }
  }

  async reloadAttributes(): Promise<void> {
    try {
      const [attributes, attributeValues] = await Promise.all([
        this.customAttributesService.getCustomAttributes(this.featureName),
        this.customAttributesService.getCustomAttributeValuesForFeature(
          this.entity.id,
          this.featureName === CustomAttributeFeature.ORGANIZATION ? 'Investor' : this.featureName
        )
      ]);
      this.customAttributes = attributes;
      this.customAttributeValues = attributeValues;
      this.init();
    } catch (e) {
      this.utility.showError(e);
    }
  }

  resetForm(): void {
    this.confirmationVisible = false;
    this.form.reset();
    if (this.customAttributeValues.length > 0) {
      this.updateForm();
    }
  }

  toggleManageAttributesModal(): void {
    this.hideManageAttributesModal = !this.hideManageAttributesModal;
  }

  async saveAttributes(entityId?: number): Promise<void> {
    try {
      if (entityId) {
        this.entity = { id: entityId };
      }
      const attributeValues: {} = this.form.value;
      const promises = this.processAttributeValues(attributeValues);
      if (!promises) {
        if (!this.showConfirmation) {
          this.toastr.info('No changes to update');
        }
        return;
      }
      // TODO Check this
      const customAttributesResponse = await promises;
      this.update.emit(customAttributesResponse || []);
      this.pinnaklSpinner.spin();
      if (!this.showConfirmation) {
        this.toastr.success('Changes saved successfully');
      }
      this.customAttributeValues = customAttributesResponse;
      this.addValueToCustomAttributes();
      this.updateForm();
      if (this.helper && this.entityKey === 'securityId') {
        this.helper.formSubmitted.next();
      }
    } catch (e) {
      this.utility.showError(e);
    } finally {
      this.pinnaklSpinner.stop();
    }
  }

  showConfirmation(): void {
    this.confirmationVisible = true;
  }

  private addValueToCustomAttributes(): void {
    this.customAttributesWithValue = <CustomAttributeWithValue[]>(
      cloneDeep(this.customAttributes)
    );
    if (!this.customAttributesWithValue?.length) {
      return;
    }
    for (const ca of this.customAttributesWithValue) {
      const customAttributeValue = find(this.customAttributeValues, {
        customAttributeId: ca.id
      });
      ca.value = customAttributeValue?.value ?? null;
      ca.valueId = +customAttributeValue?.id ?? null;
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group(
      reduce(this.customAttributes, (group, attr) => ({...group, [attr.name]: this.fb.control(null)}), {})
    );
    if (this.customAttributeValues?.length > 0) {
      this.updateForm();
    }
  }

  private processAttributeValues(currentValues: {}): Promise<any> {
    const promises: Promise<void | CustomAttributeValue>[] = [];
    this.customAttributesWithValue?.forEach((attribute, index) => {
      const currentValue = currentValues[attribute.name],
        existingValue = attribute.value;
      if (this.valueUpdated(attribute.type, currentValue, existingValue)) {
        let currentValueValid: boolean;
        switch (attribute.type) {
          case 'Number':
            currentValueValid = currentValue !== null;
            break;
          case 'Checkbox':
            currentValueValid = currentValue !== null;
            break;
          default:
            currentValueValid = !!currentValue;
        }
        if (attribute.valueId) {
          if (currentValueValid) {
            promises.push(
              this.customAttributesService.putCustomAttributeValue(<
                CustomAttributeValue
                >{
                id: String(attribute.valueId),
                type: attribute.type,
                value: currentValue
              }, this.featureName, CustomAttributeMappingTable[this.featureName.toUpperCase()]).then(res => {
                this.customAttributesWithValue[index] = {
                  ...(res as unknown as CustomAttributeWithValue),
                  listOptions: this.customAttributesWithValue[index].listOptions
                };
                return res;
              })
            );
          } else {
            promises.push(
              this.customAttributesService.deleteCustomAttributeValue(
                attribute.valueId
              ).then(res => {
                this.customAttributesWithValue = this.customAttributesWithValue.map(x => x.id === attribute.id ? ({...x, value: null}) : x);
                return res;
              })
            );
          }
        } else {
          if (currentValueValid) {
            promises.push(
              this.customAttributesService.postCustomAttributeValue({
                customAttributeId: attribute.id,
                [this.entityKey]: this.entity.id,
                type: attribute.type,
                value: currentValue
              } as CustomAttributeValue, this.featureName, CustomAttributeMappingTable[this.featureName.toUpperCase()]).then(res => {
                this.customAttributesWithValue[index] = {
                  ...(res as unknown as CustomAttributeWithValue),
                  listOptions: this.customAttributesWithValue[index].listOptions
                };
                return res;
              })
            );
          }
        }
      }
    });
    return promises.length === 0 ? null : <any>Promise.all(promises);
  }

  private updateForm(): void {
    const formValues = {};
    for (const attribute of this.customAttributesWithValue) {
      formValues[attribute.name] = attribute.value;
    }
    this.form.patchValue(formValues);
  }

  private valueUpdated(
    attributeType: string,
    currentValue: Date | number | string,
    existingValue: Date | number | string
  ): boolean {
    switch (attributeType) {
      case 'Date':
        return !this.utility.compareDates(
          <Date>currentValue,
          <Date>existingValue
        );
      case 'Number':
        return !this.utility.compareNumeric(
          <number>currentValue,
          <number>existingValue
        );
      default:
        return !this.utility.compareStrings(
          <string>currentValue,
          <string>existingValue
        );
    }
  }
}
