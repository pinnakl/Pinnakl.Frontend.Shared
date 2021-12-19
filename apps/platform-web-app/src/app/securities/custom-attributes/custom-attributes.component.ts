import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import * as _ from 'lodash';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { CustomAttributeFeature, CustomAttributeValue, CustomAttributeWithValue } from '@pnkl-frontend/shared';
import { CustomAttribute } from '@pnkl-frontend/shared';
import { Security } from '@pnkl-frontend/shared';
import { CustomAttributesService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../shared/securities-helper.service';

@Component({
  selector: 'custom-attributes',
  templateUrl: 'custom-attributes.component.html'
})
export class OldCustomAttributesComponent implements OnInit {
  @Input() customAttributes: CustomAttribute[];
  private customAttributesWithValue: CustomAttributeWithValue[];
  @Input() customAttributeValues: CustomAttributeValue[];
  confirmationVisible = false;
  form: FormGroup;
  hideManageAttributesModal = true;
  @Input() security: Security;

  constructor(
    private readonly customAttributesService: CustomAttributesService,
    private readonly pinnaklSpinner: PinnaklSpinner,
    private readonly securitiesHelper: SecuritiesHelper,
    private readonly toastr: Toastr,
    private readonly utility: Utility
  ) { }

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
      default:
        return type;
    }
  }

  ngOnInit(): void {
    this.addValueToCustomAttributes();
    this.initializeForm();
  }

  reloadAttributes(): void {
    Promise.all([
      this.customAttributesService.getCustomAttributes(CustomAttributeFeature.SECURITY),
      this.customAttributesService.getCustomAttributeValuesForFeature(
        this.security.id,
        CustomAttributeFeature.SECURITY
      )
    ])
      .then(result => {
        const [attributes, attributeValues] = result;
        this.customAttributes = attributes;
        this.customAttributeValues = attributeValues;
        this.ngOnInit();
      })
      .catch(this.utility.errorHandler.bind(this));
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

  saveAttributes(): void {
    const attributeValues = this.form.value,
      promise = this.processAttributeValues(attributeValues);
    if (!promise) {
      this.toastr.info('No changes to update');
      return;
    }
    this.pinnaklSpinner.spin();
    promise
      .then(values =>
        this.customAttributesService.getCustomAttributeValuesForFeature(
          this.security.id,
          CustomAttributeFeature.SECURITY
        )
      )
      .then(customAttributeValues => {
        this.pinnaklSpinner.stop();
        this.toastr.success('Changes saved successfully');
        this.customAttributeValues = customAttributeValues;
        this.addValueToCustomAttributes();
        this.updateForm();
        this.securitiesHelper.formSubmitted.next();
      })
      .catch(this.utility.errorHandler.bind(this));
  }

  showConfirmation(): void {
    this.confirmationVisible = true;
  }

  private addValueToCustomAttributes(): void {
    this.customAttributesWithValue = <any>_.cloneDeep(this.customAttributes);
    for (const ca of this.customAttributesWithValue) {
      const customAttributeValue = _.find(this.customAttributeValues, {
        customAttributeId: ca.id
      });
      ca.value = customAttributeValue ? customAttributeValue.value : null;
      ca.valueId = customAttributeValue ? +customAttributeValue.id : null;
    }
  }

  private initializeForm(): void {
    const group = {};
    for (const attribute of this.customAttributes) {
      group[attribute.name] = new FormControl();
    }
    this.form = new FormGroup(group);
    if (this.customAttributeValues.length > 0) {
      this.updateForm();
    }
  }

  private processAttributeValues(currentValues: any): Promise<void> {
    const promises: Promise<void | CustomAttributeValue>[] = [];
    for (const attribute of this.customAttributesWithValue) {
      const currentValue = currentValues[attribute.name],
        existingValue = attribute.value;
      if (this.valueUpdated(attribute.type, currentValue, existingValue)) {
        let currentValueValid: boolean;
        switch (attribute.type) {
          case 'Number':
            currentValueValid = currentValue !== null;
            break;
          default:
            currentValueValid = !!currentValue;
        }
        if (attribute.valueId) {
          if (currentValueValid) {
            promises.push(
              this.customAttributesService.putCustomAttributeValue({
                id: attribute.valueId.toString(),
                type: attribute.type,
                value: currentValue
              } as CustomAttributeValue)
            );
          } else {
            promises.push(
              this.customAttributesService.deleteCustomAttributeValue(
                attribute.valueId
              )
            );
          }
        } else {
          if (currentValueValid) {
            promises.push(
              this.customAttributesService.postCustomAttributeValue({
                customAttributeId: attribute.id,
                securityId: this.security.id,
                type: attribute.type,
                value: currentValue
              } as CustomAttributeValue)
            );
          }
        }
      }
    }
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
