import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Toastr } from '@pnkl-frontend/core';
import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Utility } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../shared/securities-helper.service';

@Component({ template: '' })
export abstract class AssetAdditionalInformationComponent<T = any> implements OnInit {
  cancelConfirmationVisible = false;
  form: FormGroup;
  @Input() asset: any;

  constructor(
    protected fb: FormBuilder,
    private readonly pinnaklSpinner: PinnaklSpinner,
    private readonly securitiesHelper: SecuritiesHelper,
    private readonly toastr: Toastr,
    protected utility: Utility
  ) {}

  cancelReset(): void {
    this.cancelConfirmationVisible = false;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.patchFormValue();
  }

  resetForm(): void {
    this.cancelConfirmationVisible = false;
    this.form.reset();
    this.patchFormValue();
  }

  saveInformation(): void {
    const asset: any = this.form.value;
    const updatedAsset = this.getUpdatedAsset(asset, this.asset);
    if (!updatedAsset) {
      this.toastr.info('No changes to update');
      return;
    }
    this.pinnaklSpinner.spin();
    this.saveAsset(updatedAsset)
      .then(savedAsset => {
        this.pinnaklSpinner.stop();
        this.toastr.success('Changes saved successfully');
        this.asset = savedAsset;
        this.resetForm();
        this.securitiesHelper.formSubmitted.next();
      })
      .catch(this.utility.errorHandler.bind(this));
  }

  showFormCancelConfirmation(): void {
    this.cancelConfirmationVisible = true;
  }

  protected abstract getUpdatedAsset(
    entity: any,
    existingEntity: any
  ): any;

  protected abstract initializeForm(): void;

  protected abstract patchFormValue(): void;

  protected abstract saveAsset(asset: any): Promise<any>;
}
