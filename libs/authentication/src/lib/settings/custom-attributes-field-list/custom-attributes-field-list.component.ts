import { Component, OnInit } from '@angular/core';
import { PinnaklSpinner, Toastr } from '@pnkl-frontend/core';
import { CustomAttribute, CustomAttributeFeature, CustomAttributesService, CustomAttributeValue, Utility } from '@pnkl-frontend/shared';

export type FeatureName = 'ORGANIZATION' | 'CONTACT';

@Component({
  selector: 'custom-attributes-field-list',
  templateUrl: './custom-attributes-field-list.component.html',
  styleUrls: ['./custom-attributes-field-list.component.scss']
})
export class CustomAttributesFieldListComponent implements OnInit {

  organizationCustomAttributes: CustomAttribute[];
  contactCustomAttributes: CustomAttribute[];
  selectedCustomAttribute = {} as CustomAttribute;
  customAttributeValues$: Promise<CustomAttributeValue[]>;

  customAttributeFeatureName: FeatureName;
  showCustomAttributeModal: boolean;
  confirmationOrganizationVisible = [];
  confirmationContactVisible = [];
  editMode: boolean;

  constructor(
    private readonly customAttributesService: CustomAttributesService,
    private readonly pinnaklSpinner: PinnaklSpinner,
    private readonly toastr: Toastr,
    private readonly utility: Utility) { }

  ngOnInit(): void {
    this.reloadAttributes();
  }

  onEditorClose(): void {
    this.showCustomAttributeModal = false;
  }

  onEditCustomAttribute(customAttribute: CustomAttribute, feature: FeatureName): void {
    this.customAttributeFeatureName = feature;
    this.editMode = true;
    this.showCustomAttributeModal = true;
    this.selectedCustomAttribute = customAttribute || {} as CustomAttribute;
  }

  onAddNew(feature: FeatureName): void {
    this.customAttributeFeatureName = feature;
    this.selectedCustomAttribute = null;
    this.showCustomAttributeModal = true;
    this.editMode = false;
  }

  onDeleteCustomAttribute(index: number, feature: FeatureName): void {
    if (feature === 'ORGANIZATION') {
      this.confirmationOrganizationVisible[index] = true;
    } else if (feature === 'CONTACT') {
      this.confirmationContactVisible[index] = true;
    }
  }

  async removeCustomAttribute(selectedAttribute: CustomAttribute, index: number, feature: FeatureName): Promise<void> {
    try {
      const promises: Promise<any> =
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
      if (feature === 'CONTACT') {
        this.contactCustomAttributes = this.contactCustomAttributes.filter(ca => ca.id !== selectedAttribute.id);
      } else if (feature === 'ORGANIZATION') {
        this.organizationCustomAttributes = this.organizationCustomAttributes.filter(ca => ca.id !== selectedAttribute.id);
      }
      this.toastr.success('Attribute deleted successfully');
    } catch (e) {
      this.utility.showError(e);
    } finally {
      this.pinnaklSpinner.stop();
    }
  }

  toggleManageAttributesModal(): void {
    this.showCustomAttributeModal = !this.showCustomAttributeModal;
    this.editMode = false;
  }

  reloadAttributes(): void {
    this.showCustomAttributeModal = false;
    this.pinnaklSpinner.spin();
    try {
    this.customAttributesService.getCustomAttributes(CustomAttributeFeature.ORGANIZATION).then(res => {
      this.organizationCustomAttributes = res;
      this.pinnaklSpinner.stop();
    }).catch(() => this.pinnaklSpinner.stop());
    this.customAttributesService.getCustomAttributes(CustomAttributeFeature.CONTACT).then(res => {
      this.contactCustomAttributes = res;
    });
  } finally {
    this.pinnaklSpinner.stop();
  }
  }

}
