import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';
import { Subscription } from 'rxjs';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { Organization } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import { OrganizationService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'organizations',
  templateUrl: 'organizations.component.html',
  styleUrls: ['./organizations.component.scss']
})
export class OrganizationsComponent implements OnDestroy, OnInit {
  cancelConfirmationVisible = false;
  countries: SecurityAttributeOption[];
  existingOrganization: Organization;
  form: FormGroup;
  organizations: Organization[];
  organizationSelectionForm: FormGroup;
  organizationStatusTypes: SecurityAttributeOption[];
  submitted = false;
  subscription: Subscription;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly organizationService: OrganizationService,
    private readonly pinnaklSpinner: PinnaklSpinner,
    private readonly toastr: Toastr,
    private readonly utility: Utility
  ) {}

  cancelReset(): void {
    this.cancelConfirmationVisible = false;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    Object.assign(this, this.activatedRoute.snapshot.data.resolvedData);
    this.initializeForm();
    this.patchFormValue();
  }

  resetForm(): void {
    this.cancelConfirmationVisible = false;
    this.submitted = false;
    this.form.reset();
    this.patchFormValue();
  }

  saveInformation(): void {
    this.submitted = true;
    if (!this.form.valid) {
      return;
    }
    const organization: Organization = this.form.value,
      promise = this.existingOrganization
        ? this.putOrganization(organization)
        : this.postOrganization(organization);
    this.pinnaklSpinner.spin();
    promise
      .then(savedOrganization => {
        this.pinnaklSpinner.stop();
        if (!savedOrganization) {
          return;
        }
        this.toastr.success('Information saved successfully');
        this.existingOrganization = savedOrganization;
        this.resetForm();
      })
      .catch(this.utility.errorHandler.bind(this));
  }

  showConfirmation(): void {
    this.cancelConfirmationVisible = true;
  }

  private getUpdatedOrganization(
    entity: Organization,
    existingEntity: Organization
  ): Organization {
    const updatedEntity = {} as Organization;
    const countryCode = entity.countryCode;
    if (countryCode !== existingEntity.countryCode) {
      updatedEntity.countryCode = countryCode;
    }
    const name = entity.name;
    if (name !== existingEntity.name) {
      updatedEntity.name = name;
    }
    const riskCountryCode = entity.riskCountryCode;
    if (riskCountryCode !== existingEntity.riskCountryCode) {
      updatedEntity.riskCountryCode = riskCountryCode;
    }
    const statusId = entity.statusId;
    if (statusId !== existingEntity.statusId) {
      updatedEntity.statusId = statusId;
    }
    const ticker = entity.ticker;
    if (ticker !== existingEntity.ticker) {
      updatedEntity.ticker = ticker;
    }
    if (_.isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.id = existingEntity.id;
    return updatedEntity;
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      countryCode: [, Validators.required],
      name: [, Validators.required],
      riskCountryCode: [, Validators.required],
      statusId: [, Validators.required],
      ticker: [, Validators.required]
    });
    this.organizationSelectionForm = this.fb.group({ organization: [] });
    this.subscription = this.organizationSelectionForm.controls.organization.valueChanges.subscribe(
      (organization: Organization) => {
        this.existingOrganization = organization;
        this.patchFormValue();
      }
    );
  }

  private patchFormValue(): void {
    if (!this.existingOrganization) {
      return;
    }
    const organization = this.existingOrganization;
    this.form.patchValue({
      countryCode: organization.countryCode,
      name: organization.name,
      riskCountryCode: organization.riskCountryCode,
      statusId: organization.statusId,
      ticker: organization.ticker
    });
  }

  private postOrganization(organization: Organization): Promise<Organization> {
    return this.organizationService
      .postOrganization(organization)
      .then(savedOrganization => {
        this.organizations.push(savedOrganization);
        this.organizationSelectionForm.patchValue({
          organization: savedOrganization
        });
        return savedOrganization;
      });
  }

  private putOrganization(organization: Organization): Promise<Organization> {
    const updatedOrganization = this.getUpdatedOrganization(
      organization,
      this.existingOrganization
    );
    if (!updatedOrganization) {
      this.toastr.info('No changes to update');
      return Promise.resolve(null);
    }
    return this.organizationService
      .putOrganization(updatedOrganization)
      .then(savedOrganization => {
        const i = _.findIndex(this.organizations, ['id', savedOrganization.id]);
        this.organizations[i] = savedOrganization;
        return savedOrganization;
      });
  }
}
