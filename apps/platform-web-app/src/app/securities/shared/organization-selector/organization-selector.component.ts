import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import * as _ from 'lodash';

import { Organization } from '@pnkl-frontend/shared';

@Component({
  selector: 'organization-selector',
  templateUrl: 'organization-selector.component.html'
})
export class OrganizationSelectorComponent implements OnInit {
  countryForm: FormGroup;
  @Input() form: FormGroup;
  @Input() organizations: Organization[];

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.countryForm = this.fb.group({
      countryCode: [],
      riskCountryCode: []
    });
    this.form.controls.organizationId.valueChanges.subscribe(
      this.organizationChanged.bind(this)
    );
    this.form.controls.organizationId.updateValueAndValidity();
  }

  organizationChanged(organizationId: number): void {
    const organization = _.find(this.organizations, ['id', organizationId]);
    if (!organization) {
      this.countryForm.reset();
      return;
    }
    this.countryForm.patchValue({
      countryCode: organization.countryCode,
      riskCountryCode: organization.riskCountryCode
    });
  }
}
