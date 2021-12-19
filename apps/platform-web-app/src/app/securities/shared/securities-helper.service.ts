import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import * as _ from 'lodash';
import { Subject } from 'rxjs';

import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import { Security } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { SecurityDetailsResolvedData } from '../security-details/security-details-resolved-data.model';

@Injectable()
export class SecuritiesHelper {
  currentTab: string;
  securities: Security[];
  formSubmitted = new Subject();
  securityDetailsResolvedData: SecurityDetailsResolvedData;
  private _assetId: number;
  set assetId(value: number) {
    this._assetId = value;
  }
  get assetId(): number {
    return this._assetId;
  }
  constructor(private readonly utility: Utility) {}

  createSecurityForm(
    fb: FormBuilder,
    manualSecuritySource: number,
    sectorOptions: SecurityAttributeOption[],
    security: Security,
    initialSecurityValues: Partial<Security>
  ): FormGroup {
    if (!security) {
      return fb.group({
        currencyId: [initialSecurityValues.currencyId, Validators.required],
        dataSourceId: [manualSecuritySource, Validators.required],
        description: [initialSecurityValues.description, Validators.required],
        manualPricingIndicator: [],
        multiplier: [initialSecurityValues.multiplier, Validators.required],
        organizationId: [initialSecurityValues.organizationId, Validators.required],
        privateIndicator: [],
        sector: [initialSecurityValues.sector, Validators.required],
        securityTypeId: [initialSecurityValues.securityTypeId, Validators.required]
      });
    }

    const securitySectorOption = sectorOptions.find(
        sectorOption =>
          sectorOption.optionDescription.toLowerCase() ===
          security.sector.toLowerCase()
      ),
      sector = securitySectorOption
        ? securitySectorOption.optionDescription
        : undefined;
    return fb.group({
      currencyId: [security.currencyId, Validators.required],
      description: [security.description, Validators.required],
      manualPricingIndicator: [security.manualPricingIndicator],
      moodyRating: [security.moodyRating],
      multiplier: [security.multiplier, Validators.required],
      organizationId: [security.organizationId, Validators.required],
      privateIndicator: [security.privateIndicator],
      sandpRating: [security.sandpRating],
      sector: [sector, Validators.required],
      securityTypeId: [security.securityTypeId, Validators.required]
    });
  }

  public getUpdatedSecurity(
    entity: Security,
    existingEntity: Security
  ): Security {
    const updatedEntity = {} as Security;
    const currencyId = entity.currencyId;
    if (!this.utility.compareNumeric(currencyId, existingEntity.currencyId)) {
      updatedEntity.currencyId = currencyId;
    }
    const description = entity.description;
    if (!this.utility.compareStrings(description, existingEntity.description)) {
      updatedEntity.description = description;
    }
    const privateIndicator = !!entity.privateIndicator;
    if (privateIndicator !== existingEntity.privateIndicator) {
      updatedEntity.privateIndicator = privateIndicator;
    }
    const manualPricingIndicator = !!entity.manualPricingIndicator;
    if (manualPricingIndicator !== existingEntity.manualPricingIndicator) {
      updatedEntity.manualPricingIndicator = manualPricingIndicator;
    }
    const multiplier = entity.multiplier;
    if (!this.utility.compareNumeric(multiplier, existingEntity.multiplier)) {
      updatedEntity.multiplier = multiplier;
    }
    const organizationId = entity.organizationId;
    if (
      !this.utility.compareNumeric(
        organizationId,
        existingEntity.organizationId
      )
    ) {
      updatedEntity.organizationId = organizationId;
    }
    const sandpRating = entity.sandpRating;
    if (!this.utility.compareStrings(sandpRating, existingEntity.sandpRating)) {
      updatedEntity.sandpRating = sandpRating;
    }
    const sector = entity.sector;
    if (!this.utility.compareStrings(sector, existingEntity.sector)) {
      updatedEntity.sector = sector;
    }
    const securityTypeId = entity.securityTypeId;
    if (
      !this.utility.compareNumeric(
        securityTypeId,
        existingEntity.securityTypeId
      )
    ) {
      updatedEntity.securityTypeId = securityTypeId;
    }
    if (_.isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.id = existingEntity.id;
    return updatedEntity;
  }

  resetSecurityForm(
    form: FormGroup,
    sectorOptions: SecurityAttributeOption[],
    security: Security
  ): void {
    const securitySectorOption = sectorOptions.find(
        sectorOption =>
          sectorOption.optionDescription.toLowerCase() ===
          security.sector.toLowerCase()
      ),
      sector = securitySectorOption
        ? securitySectorOption.optionDescription
        : undefined;
    form.patchValue({
      security: {
        currencyId: security.currencyId,
        description: security.description,
        manualPricingIndicator: security.manualPricingIndicator,
        moodyRating: security.moodyRating,
        multiplier: security.multiplier,
        organizationId: security.organizationId,
        privateIndicator: security.privateIndicator,
        sandpRating: security.sandpRating,
        sector: sector,
        securityTypeId: security.securityTypeId
      }
    });
  }
}
