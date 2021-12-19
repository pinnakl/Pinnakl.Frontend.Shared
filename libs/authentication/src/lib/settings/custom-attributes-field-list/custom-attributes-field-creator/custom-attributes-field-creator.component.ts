import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PinnaklSpinner, Toastr } from '@pnkl-frontend/core';
import {
  CustomAttribute,
  CustomAttributeFeature,
  CustomAttributeListOption,
  CustomAttributeMappingTable,
  CustomAttributesService,
  Utility
} from '@pnkl-frontend/shared';
import { find, isEqual, some } from 'lodash';

@Component({
  selector: 'pnkl-custom-attributes-field-creator',
  templateUrl: './custom-attributes-field-creator.component.html',
  styleUrls: ['./custom-attributes-field-creator.component.scss'],
})
export class CustomAtttributeComponent implements OnInit {
    @Input() set customAttribute(value: CustomAttribute) {
      if (value) {
        this.form?.patchValue({
          ...value,
        });
        this.listOptions = value?.listOptions?.map(x => x as CustomAttributeListOption) || [];
      } else {
        this.resetForm();
      }
    }
    @Input() set setCustomAttributeFeature(feature: 'ORGANIZATION' | 'CONTACT') {
      this.customAtributeFeature = CustomAttributeFeature[feature];
      this.customAtributeMappingTable = CustomAttributeMappingTable[feature];
    }
    @Input() editMode: boolean;

    @Output() customAttributesUpdated = new EventEmitter<void>();

    form: FormGroup;

    listOptions = [] as CustomAttributeListOption[];
    attributeTypes = ['List', 'Number', 'Text', 'Url', 'Date', 'Checkbox'];

    confirmationVisible: boolean;
    editorVisible: boolean;
    submitted: boolean;

    customAtributeFeature: CustomAttributeFeature;
    customAtributeMappingTable: CustomAttributeMappingTable;

    constructor(
      private readonly customAttributesService: CustomAttributesService,
      private readonly fb: FormBuilder,
      private readonly pinnaklSpinner: PinnaklSpinner,
      private readonly toastr: Toastr,
      private readonly utility: Utility,
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
      console.log(this.listOptions);
      this.form.patchValue({ listOption: null });
      (<HTMLInputElement>event.target).focus();
    }

    get options(): any {
      return this.listOptions;
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
        this.editMode ? await this.updateCustomAttribute() : await this.postAttribute();
        this.customAttributesUpdated.emit();
        this.resetForm();
      } catch (e) {
        this.utility.showError(e);
      } finally {
        this.pinnaklSpinner.stop();
      }
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
        id: null,
        name: [undefined, Validators.required],
        type: [undefined, Validators.required],
        listOption: [],
      });
    }

    private postAttribute(): Promise<void> {
      const { name, type } = <{ name: string; type: string }>this.form.value;
      const promises = this.customAttributesService.postCustomAttribute(<
        CustomAttribute
      >{
        name,
        type
      }, this.customAtributeFeature, this.customAtributeMappingTable);
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

    private updateCustomAttribute(): Promise<void> {
      const { name, id, type } = this.form.value;
      const promises =
      this.customAttributesService.putCustomAttribute(<CustomAttribute>{
        id,
        name,
        type
      }, this.customAtributeFeature, this.customAtributeMappingTable);
      if (type !== 'List') {
        if (!promises) {
          this.toastr.info('No changes to update');
          return Promise.resolve();
        } else {
          return <any>promises;
        }
      }
      const listOptionsPromise = this.processListOptions(this.form.value);
      if (!promises && !listOptionsPromise) {
        this.toastr.info('No changes to update');
        return Promise.resolve();
      }
      return <any>Promise.all([promises, listOptionsPromise]);
    }
}
