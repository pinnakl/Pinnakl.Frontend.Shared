import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import * as _ from 'lodash';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { CustomAttributeFeature, CustomAttributeListOption, CustomAttributeMappingTable } from '@pnkl-frontend/shared';
import { CustomAttribute } from '@pnkl-frontend/shared';
import { CustomAttributesService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';

@Component({
  selector: 'custom-attribute-creator',
  templateUrl: 'custom-attribute-creator.component.html'
})
export class OldCustomAttributeCreatorComponent implements OnInit {
  attributeTypes = ['List', 'Number', 'Text', 'Url', 'Date', 'Checkbox'];
  confirmationVisible = false;
  @Input() customAttributes: CustomAttribute[];
  @Output() customAttributesUpdated = new EventEmitter<void>();
  editMode = false;
  editorVisible = false;
  form: FormGroup;
  listOptions = [] as CustomAttributeListOption[];
  submitted = false;

  constructor(
    private readonly customAttributesService: CustomAttributesService,
    private readonly fb: FormBuilder,
    private readonly pinnaklSpinner: PinnaklSpinner,
    private readonly toastr: Toastr,
    private readonly utility: Utility
  ) { }

  addListOption(event: FocusEvent, listOption: string): void {
    if (!listOption || _.some(this.listOptions, { listOption })) {
      return;
    }
    const selectedAttribute: CustomAttribute = this.form.value.selectedAttribute;
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

  deleteAttribute(): void {
    this.confirmationVisible = false;
    const selectedAttribute: CustomAttribute = this.form.value.selectedAttribute,
      promise: Promise<void> =
        selectedAttribute.type !== 'List'
          ? Promise.resolve()
          : <any>(
              Promise.all(
                selectedAttribute.listOptions.map(lo =>
                  this.customAttributesService.deleteCustomAttributeListOption(
                    lo.id
                  )
                )
              )
            );
    this.pinnaklSpinner.spin();
    promise
      .then(() =>
        this.customAttributesService.deleteCustomAttribute(selectedAttribute.id)
      )
      .then(() => {
        this.pinnaklSpinner.stop();
        this.toastr.success('Attribute deleted successfully');
        this.form.reset();
        this.customAttributesUpdated.emit();
      })
      .catch(this.utility.errorHandler.bind(this));
  }

  editAttribute(): void {
    const selectedAttribute: CustomAttribute = this.form.value.selectedAttribute;
    if (!selectedAttribute) {
      return;
    }
    this.noAttributeValuesExist(selectedAttribute)
      .then(() => {
        this.editMode = true;
        this.form.patchValue({
          name: selectedAttribute.name,
          type: selectedAttribute.type
        });
        if (selectedAttribute.listOptions) {
          this.listOptions = _.cloneDeep(selectedAttribute.listOptions);
        }
      })
      .catch(() => {});
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

  saveAttribute(): void {
    this.submitted = true;
    if (!this.form.valid) {
      return;
    }
    if (this.form.value.type === 'List' && this.listOptions.length < 2) {
      this.toastr.error('Add at least 2 options to the list');
      return;
    }
    const promise = this.editMode ? this.putAttribute() : this.postAttribute();
    this.pinnaklSpinner.spin();
    promise
      .then(() => {
        this.pinnaklSpinner.stop();
        this.customAttributesUpdated.emit();
        this.resetForm();
      })
      .catch(this.utility.errorHandler.bind(this));
  }

  showDeleteConfirmation(): void {
    const selectedAttribute: CustomAttribute = this.form.value.selectedAttribute;
    if (!selectedAttribute) {
      return;
    }
    this.noAttributeValuesExist(selectedAttribute)
      .then(() => (this.confirmationVisible = true))
      .catch(() => {});
  }

  private noAttributeValuesExist(
    selectedAttribute: CustomAttribute
  // eslint-disable-next-line @typescript-eslint/ban-types
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
    const updatedEntity = {} as CustomAttributeListOption;
    const viewOrder = entity.viewOrder;
    if (!this.utility.compareNumeric(viewOrder, existingEntity.viewOrder)) {
      updatedEntity.viewOrder = viewOrder;
    }
    if (_.isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.id = existingEntity.id;
    return updatedEntity;
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: [, Validators.required],
      type: [, Validators.required],
      listOption: [],
      selectedAttribute: []
    });
  }

  private postAttribute(): Promise<void> {
    const { name, type } = this.form.value as { name: string; type: string },
      promise = this.customAttributesService.postCustomAttribute({
        name,
        type
      } as CustomAttribute, CustomAttributeFeature.SECURITY, CustomAttributeMappingTable.SECURITY);
    return type !== 'List' ? promise : <any>promise.then(attribute =>
          Promise.all(
            this.listOptions.map((lo, i) =>
              this.customAttributesService.postCustomAttributeListOption({
                customAttributeId: attribute.id,
                listOption: lo.listOption,
                viewOrder: i + 1
              } as CustomAttributeListOption)
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
        promises.push(<any>(
          this.customAttributesService.postCustomAttributeListOption({
            customAttributeId: selectedAttribute.id,
            listOption: lo.listOption,
            viewOrder: lo.viewOrder
          } as CustomAttributeListOption)
        ));
      } else {
        const existingListOption = _.find(selectedAttribute.listOptions, {
            listOption: lo.listOption
          }),
          updatedListOption = existingListOption
            ? this.getUpdatedListOption(lo, existingListOption)
            : null;
        if (updatedListOption) {
          promises.push(<any>(
            this.customAttributesService.putCustomAttributeListOption(
              updatedListOption
            )
          ));
        }
      }
    }
    for (const lo of selectedAttribute.listOptions) {
      if (!_.some(this.listOptions, { listOption: lo.listOption })) {
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
      },
      promise =
        name === selectedAttribute.name
          ? null
          : this.customAttributesService.putCustomAttribute({
              id: selectedAttribute.id,
              name
            } as CustomAttribute, CustomAttributeFeature.SECURITY, CustomAttributeMappingTable.SECURITY);
    if (type !== 'List') {
      if (!promise) {
        this.toastr.info('No changes to update');
        return Promise.resolve();
      } else {
        return <any>promise;
      }
    }
    const listOptionsPromise = this.processListOptions(selectedAttribute);
    if (!promise && !listOptionsPromise) {
      this.toastr.info('No changes to update');
      return Promise.resolve();
    }
    return <any>Promise.all([promise, listOptionsPromise]);
  }
}
