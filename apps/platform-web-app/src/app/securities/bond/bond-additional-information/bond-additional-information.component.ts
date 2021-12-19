import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import * as _ from 'lodash';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { Bond } from '@pnkl-frontend/shared';
import { BondService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { AssetAdditionalInformationComponent } from '../../shared/asset-additional-information.component';
import { SecuritiesHelper } from '../../shared/securities-helper.service';

@Component({
  selector: 'bond-additional-information',
  templateUrl: 'bond-additional-information.component.html'
})
export class BondAdditionalInformationComponent extends AssetAdditionalInformationComponent {
  constructor(
    fb: FormBuilder,
    pinnaklSpinner: PinnaklSpinner,
    toastr: Toastr,
    utility: Utility,
    private readonly bondService: BondService,
    securitiesHelper: SecuritiesHelper
  ) {
    super(fb, pinnaklSpinner, securitiesHelper, toastr, utility);
  }

  protected getUpdatedAsset(entity: Bond, existingEntity: Bond): Bond {
    const updatedEntity = {} as Bond;
    const callIndicator = !!entity.callIndicator;
    if (callIndicator !== existingEntity.callIndicator) {
      updatedEntity.callIndicator = callIndicator;
    }
    const convertibleIndicator = !!entity.convertibleIndicator;
    if (convertibleIndicator !== existingEntity.convertibleIndicator) {
      updatedEntity.convertibleIndicator = convertibleIndicator;
    }
    const defaultIndicator = !!entity.defaultIndicator;
    if (defaultIndicator !== existingEntity.defaultIndicator) {
      updatedEntity.defaultIndicator = defaultIndicator;
    }
    const pikIndicator = !!entity.pikIndicator;
    if (pikIndicator !== existingEntity.pikIndicator) {
      updatedEntity.pikIndicator = pikIndicator;
    }
    const putIndicator = !!entity.putIndicator;
    if (putIndicator !== existingEntity.putIndicator) {
      updatedEntity.putIndicator = putIndicator;
    }
    const sinkIndicator = !!entity.sinkIndicator;
    if (sinkIndicator !== existingEntity.sinkIndicator) {
      updatedEntity.sinkIndicator = sinkIndicator;
    }
    const strippableIndicator = !!entity.strippableIndicator;
    if (strippableIndicator !== existingEntity.strippableIndicator) {
      updatedEntity.strippableIndicator = strippableIndicator;
    }
    const underlyingSecurityId = entity.underlyingSecurityId;
    if (
      !this.utility.compareNumeric(
        underlyingSecurityId,
        existingEntity.underlyingSecurityId
      )
    ) {
      updatedEntity.underlyingSecurityId = underlyingSecurityId;
    }
    if (_.isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.id = existingEntity.id;
    return updatedEntity;
  }

  protected initializeForm(): void {
    this.form = this.fb.group({
      callIndicator: [],
      convertibleIndicator: [],
      defaultIndicator: [],
      pikIndicator: [],
      putIndicator: [],
      sinkIndicator: [],
      strippableIndicator: [],
      underlyingSecurityId: []
    });
  }

  protected patchFormValue(): void {
    const asset = this.asset as Bond;
    this.form.patchValue({
      callIndicator: asset.callIndicator,
      convertibleIndicator: asset.convertibleIndicator,
      defaultIndicator: asset.defaultIndicator,
      pikIndicator: asset.pikIndicator,
      putIndicator: asset.putIndicator,
      sinkIndicator: asset.sinkIndicator,
      strippableIndicator: asset.strippableIndicator,
      underlyingSecurityId: asset.underlyingSecurityId
    });
  }

  protected saveAsset(asset: Bond): Promise<Bond> {
    return this.bondService.putBond(asset);
  }
}
