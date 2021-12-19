import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import some from 'lodash/some';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { CustomAttributeFeature, CustomAttributeMappingTable } from '../../../models';
import { CustomAttributeListOption } from './../../../models/custom-attributes/custom-attribute-list-option.model';
import { CustomAttribute } from './../../../models/custom-attributes/custom-attribute.model';
import { CustomAttributesService } from './../../../pinnakl-web-services/security/custom-attributes.service';
import { Utility } from './../../../services/utility.service';

@Component({
  selector: 'app-custom-attribute-creator',
  templateUrl: 'custom-attribute-creator.component.html'
})
export class CustomAttributeCreatorComponent implements OnInit {
  @Input() customAttributes: CustomAttribute[];
  @Input() editMode: boolean;
  @Output() customAttributesUpdated = new EventEmitter<void>();
  form: FormGroup;
  listOptions = <CustomAttributeListOption[]>[];
  attributeTypes = ['List', 'Number', 'Text', 'Url', 'Date', 'Checkbox'];
  confirmationVisible = false;
  editorVisible = false;
  submitted = false;

  constructor(
    private readonly customAttributesService: CustomAttributesService,
    private readonly fb: FormBuilder,
    private readonly pinnaklSpinner: PinnaklSpinner,
    private readonly toastr: Toastr,
    private readonly utility: Utility
  ) { }

  addListOption(event: FocusEvent, listOption: string): void {
    if (!listOption || some(this.listOptions, { listOption })) {
      return;
    }
    const selectedAttribute: CustomAttribute = this.form.value
      .selectedAttribute;
    this.listOptions = [
      ...this.listOptions,
      new CustomAttributeListOption(
        selectedAttribute ? selectedAttribute.id : undefined,
        undefined,
        listOption,
        this.listOptions.length + 1
      )
    ];
    this.form.patchValue({ listOption: null });
    (<HTMLInputElement>event.target).focus();
  }

  async deleteAttribute(): Promise<void> {
    try {
      this.confirmationVisible = false;
      const selectedAttribute: CustomAttribute = this.form.value
          .selectedAttribute,
        promises: Promise<any> =
          selectedAttribute.type !== 'List'
            ? Promise.resolve()
            : Promise.all(
                selectedAttribute.listOptions.map(option =>
                  this.customAttributesService.deleteCustomAttributeListOption(
                    option.id
                  )
                )
              );
      this.pinnaklSpinner.spin();
      await promises;
      await this.customAttributesService.deleteCustomAttribute(
        selectedAttribute.id
      );
      this.toastr.success('Attribute deleted successfully');
      this.form.reset();
      this.customAttributesUpdated.emit();
    } catch (e) {
      this.utility.showError(e);
    } finally {
      this.pinnaklSpinner.stop();
    }
  }

  async editAttribute(): Promise<void> {
    try {
      const selectedAttribute: CustomAttribute = this.form.value
        .selectedAttribute;
      if (!selectedAttribute) {
        return;
      }
      await this.noAttributeValuesExist(selectedAttribute);
      this.editMode = true;
      this.form.patchValue({
        name: selectedAttribute.name,
        type: selectedAttribute.type
      });
      if (selectedAttribute.listOptions) {
        this.listOptions = cloneDeep(selectedAttribute.listOptions);
      }
    } catch (e) {
      console.log(e);
    }
  }

  hideConfirmation(): void {
    this.confirmationVisible = false;
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  removeListOption(listOption: CustomAttributeListOption): void {
    this.listOptions = this.listOptions.filter(lo => lo !== listOption);
  }

  resetForm(): void {
    this.submitted = false;
    this.form.reset();
    this.listOptions = [];
    this.editMode = false;
  }

  async saveAttribute(): Promise<void> {
    try {
      this.submitted = true;
      if (!this.form.valid) {
        return;
      }
      if (this.form.value.type === 'List' && this.listOptions.length < 2) {
        this.toastr.error('Add at least 2 options to the list');
        return;
      }
      this.pinnaklSpinner.spin();
      this.editMode ? await this.putAttribute() : await this.postAttribute();
      this.customAttributesUpdated.emit();
      this.resetForm();
    } catch (e) {
      this.utility.showError(e);
    } finally {
      this.pinnaklSpinner.stop();
    }
  }

  async showDeleteConfirmation(): Promise<void> {
    try {
      const selectedAttribute: CustomAttribute = this.form.value
        .selectedAttribute;
      if (!selectedAttribute) {
        return;
      }
      await this.noAttributeValuesExist(selectedAttribute);
      this.confirmationVisible = true;
    } catch (e) {
      console.log(e);
    }
  }

  private noAttributeValuesExist(
    selectedAttribute: CustomAttribute
  ): Promise<{}> {
    return new Promise((resolve, reject) =>
      this.customAttributesService
        .getCustomAttributeValuesForAttribute(selectedAttribute.id)
        .then(attributeValues => {
          if (attributeValues.length > 0) {
            this.toastr.error(
              'This attribute cannot be modified. Please contact Pinnakl for more information.'
            );
            reject();
          }
          resolve({});
        })
        .catch(error => {
          this.utility.showError(error);
          reject();
        })
    );
  }

  private getUpdatedListOption(
    entity: CustomAttributeListOption,
    existingEntity: CustomAttributeListOption
  ): CustomAttributeListOption {
    const updatedEntity = <CustomAttributeListOption>{};
    const viewOrder = entity.viewOrder;
    if (!this.utility.compareNumeric(viewOrder, existingEntity.viewOrder)) {
      updatedEntity.viewOrder = viewOrder;
    }
    if (isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.id = existingEntity.id;
    return updatedEntity;
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: [undefined, Validators.required],
      type: [undefined, Validators.required],
      listOption: [],
      selectedAttribute: []
    });
  }

  private postAttribute(): Promise<void> {
    const { name, type } = <{ name: string; type: string }>this.form.value;
    const promises = this.customAttributesService.postCustomAttribute(
      { name, type } as CustomAttribute,
      CustomAttributeFeature.SECURITY,
      CustomAttributeMappingTable.SECURITY
    );
    return type !== 'List' ? promises : <any>promises.then(attribute =>
          Promise.all(
            this.listOptions.map((lo, i) =>
              this.customAttributesService.postCustomAttributeListOption(<
                CustomAttributeListOption
              >{
                customAttributeId: attribute.id,
                listOption: lo.listOption,
                viewOrder: i + 1
              })
            )
          )
        );
  }

  private processListOptions(
    selectedAttribute: CustomAttribute
  ): Promise<void> {
    const promises = [] as Promise<void>[];
    this.listOptions.forEach((lo, i) => (lo.viewOrder = i + 1));
    for (const lo of this.listOptions) {
      if (!lo.id) {
        promises.push(
          <any>this.customAttributesService.postCustomAttributeListOption({
            customAttributeId: selectedAttribute.id,
            listOption: lo.listOption,
            viewOrder: lo.viewOrder
          } as CustomAttributeListOption)
        );
      } else {
        const existingListOption = find(selectedAttribute.listOptions, {
            listOption: lo.listOption
          }),
          updatedListOption = existingListOption
            ? this.getUpdatedListOption(lo, existingListOption)
            : null;
        if (updatedListOption) {
          promises.push(
            <any>(
              this.customAttributesService.putCustomAttributeListOption(
                updatedListOption
              )
            )
          );
        }
      }
    }
    for (const lo of selectedAttribute.listOptions) {
      if (!some(this.listOptions, { listOption: lo.listOption })) {
        promises.push(
          this.customAttributesService.deleteCustomAttributeListOption(lo.id)
        );
      }
    }
    return promises.length > 0 ? <any>Promise.all(promises) : null;
  }

  private putAttribute(): Promise<void> {
    const { name, selectedAttribute, type } = this.form.value as {
      name: string;
      selectedAttribute: CustomAttribute;
      type: string;
    };
    const promises =
      name === selectedAttribute.name
        ? null
        : this.customAttributesService.putCustomAttribute(<CustomAttribute>{
            id: selectedAttribute.id,
            name,
          }, CustomAttributeFeature.SECURITY, CustomAttributeMappingTable.SECURITY);
    if (type !== 'List') {
      if (!promises) {
        this.toastr.info('No changes to update');
        return Promise.resolve();
      } else {
        return <any>promises;
      }
    }
    const listOptionsPromise = this.processListOptions(selectedAttribute);
    if (!promises && !listOptionsPromise) {
      this.toastr.info('No changes to update');
      return Promise.resolve();
    }
    return <any>Promise.all([promises, listOptionsPromise]);
  }
}
