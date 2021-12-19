import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { Fund } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import { FundService } from '@pnkl-frontend/shared';
import { MarketService } from '@pnkl-frontend/shared';
import { PublicIdentifierService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../../shared/securities-helper.service';
import { SecurityInformationComponent } from '../../shared/security-information.component';

@Component({
  selector: 'fund-information',
  templateUrl: 'fund-information.component.html'
})
export class FundInformationComponent extends SecurityInformationComponent {
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
    private readonly fundService: FundService
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

  protected createAssetForm(fund: Fund, fb: FormBuilder): FormGroup {
    if (!fund) {
      return fb.group({
        dividendFrequencyId: [],
        dividendRate: [],
        sharesOutstanding: []
      });
    }
    return fb.group({
      dividendFrequencyId: [fund.dividendFrequencyId],
      dividendRate: [fund.dividendRate],
      sharesOutstanding: [fund.sharesOutstanding]
    });
  }

  protected getUpdatedAsset(entity: Fund, existingEntity: Fund): Fund {
    const updatedEntity = {} as Fund;
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
    const sharesOutstanding = entity.sharesOutstanding;
    if (
      !this.utility.compareNumeric(
        sharesOutstanding,
        existingEntity.sharesOutstanding
      )
    ) {
      updatedEntity.sharesOutstanding = sharesOutstanding;
    }
    if (_.isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.id = existingEntity.id;
    return updatedEntity;
  }

  protected postAsset(fund: Fund): Promise<Fund> {
    return this.fundService.postFund(fund);
  }

  protected putAsset(fund: Fund): Promise<Fund> {
    return this.fundService.putFund(fund);
  }

  protected resetAssetForm(fund: Fund, form: FormGroup): void {
    form.patchValue({
      asset: {
        dividendFrequencyId: fund.dividendFrequencyId,
        dividendRate: fund.dividendRate,
        sharesOutstanding: fund.sharesOutstanding
      }
    });
  }
}
