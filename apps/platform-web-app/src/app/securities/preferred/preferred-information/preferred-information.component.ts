import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { Preferred } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import { MarketService } from '@pnkl-frontend/shared';
import { PreferredService } from '@pnkl-frontend/shared';
import { PublicIdentifierService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../../shared/securities-helper.service';
import { SecurityInformationComponent } from '../../shared/security-information.component';

@Component({
  selector: 'preferred-information',
  templateUrl: 'preferred-information.component.html'
})
export class PreferredInformationComponent extends SecurityInformationComponent {
  @Input() dividendFrequencyOptions: SecurityAttributeOption[];

  constructor(
    activatedRoute: ActivatedRoute,
    fb: FormBuilder,
    marketService: MarketService,
    pinnaklSpinner: PinnaklSpinner,
    publicIdentifierService: PublicIdentifierService,
    router: Router,
    securitiesHelper: SecuritiesHelper,
    securityService: SecurityService,
    toastr: Toastr,
    utility: Utility,
    private readonly preferredService: PreferredService
  ) {
    super(
      activatedRoute,
      fb,
      marketService,
      pinnaklSpinner,
      publicIdentifierService,
      router,
      securitiesHelper,
      securityService,
      toastr,
      utility
    );
  }

  protected createAssetForm(asset: Preferred, fb: FormBuilder): FormGroup {
    if (!asset) {
      return fb.group({
        dividendFrequencyId: [, Validators.required],
        dividendRate: [, Validators.required],
        minPiece: [, Validators.required],
        nominalValue: [, Validators.required],
        outstandingAmount: []
      });
    }
    return fb.group({
      dividendFrequencyId: [asset.dividendFrequencyId, Validators.required],
      dividendRate: [asset.dividendRate, Validators.required],
      minPiece: [asset.minPiece, Validators.required],
      nominalValue: [asset.nominalValue, Validators.required],
      outstandingAmount: [asset.outstandingAmount]
    });
  }

  protected getUpdatedAsset(
    entity: Preferred,
    existingEntity: Preferred
  ): Preferred {
    const updatedEntity = {} as Preferred;
    const dividendFrequencyId = entity.dividendFrequencyId;
    if (
      !this.utility.compareNumeric(
        dividendFrequencyId,
        existingEntity.dividendFrequencyId
      )
    ) {
      updatedEntity.dividendFrequencyId = dividendFrequencyId;
    }
    const dividendRate = entity.dividendRate;
    if (
      !this.utility.compareNumeric(dividendRate, existingEntity.dividendRate)
    ) {
      updatedEntity.dividendRate = dividendRate;
    }
    const minPiece = entity.minPiece;
    if (!this.utility.compareNumeric(minPiece, existingEntity.minPiece)) {
      updatedEntity.minPiece = minPiece;
    }
    const nominalValue = entity.nominalValue;
    if (
      !this.utility.compareNumeric(nominalValue, existingEntity.nominalValue)
    ) {
      updatedEntity.nominalValue = nominalValue;
    }
    const outstandingAmount = entity.outstandingAmount;
    if (
      !this.utility.compareNumeric(
        outstandingAmount,
        existingEntity.outstandingAmount
      )
    ) {
      updatedEntity.outstandingAmount = outstandingAmount;
    }
    if (_.isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.id = existingEntity.id;
    return updatedEntity;
  }

  protected postAsset(asset: Preferred): Promise<Preferred> {
    return this.preferredService.postPreferred(asset);
  }

  protected putAsset(asset: Preferred): Promise<Preferred> {
    return this.preferredService.putPreferred(asset);
  }

  protected resetAssetForm(asset: Preferred, form: FormGroup): void {
    form.patchValue({
      asset: {
        dividendFrequencyId: asset.dividendFrequencyId,
        dividendRate: asset.dividendRate,
        minPiece: asset.minPiece,
        nominalValue: asset.nominalValue,
        outstandingAmount: asset.outstandingAmount
      }
    });
  }
}
