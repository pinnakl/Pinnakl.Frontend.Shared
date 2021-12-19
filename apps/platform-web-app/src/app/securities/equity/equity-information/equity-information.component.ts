import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { EquitySharesOutstanding } from '@pnkl-frontend/shared';
import { EquitySharesOutstandingService } from '@pnkl-frontend/shared';
import { Equity } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import { EquityService } from '@pnkl-frontend/shared';
import { MarketService } from '@pnkl-frontend/shared';
import { PublicIdentifierService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../../shared/securities-helper.service';
import { SecurityInformationComponent } from '../../shared/security-information.component';

@Component({
  selector: 'equity-information',
  templateUrl: 'equity-information.component.html'
})
export class EquityInformationComponent extends SecurityInformationComponent {
  @Input() dividendFrequencyOptions: SecurityAttributeOption[];

  asset: { id: number; securityId: number; sharesOutstanding: number };
  sharesOutstandingManagerVisible = false;
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
    private equityService: EquityService,
    private equitySharesOutstanding: EquitySharesOutstandingService
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

  onSharesOutstandingChange(sharesOutstanding: number): void {
    this.asset.sharesOutstanding = sharesOutstanding;
  }

  protected createAssetForm(equity: Equity, fb: FormBuilder): FormGroup {
    if (!equity) {
      return fb.group({
        dividendFrequencyId: [],
        dividendRate: [],
        sharesOutstanding: []
      });
    }
    return fb.group({
      dividendFrequencyId: [equity.dividendFrequencyId],
      dividendRate: [equity.dividendRate],
      sharesOutstanding: [equity.sharesOutstanding]
    });
  }

  protected getUpdatedAsset(entity: Equity, existingEntity: Equity): Equity {
    const updatedEntity = {} as Equity;
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

  protected postAsset(equity: Equity): Promise<Equity> {
    return this.equityService
      .postEquity(equity)
      .then(equityInfo => {
        const equitySharesOutstanding: EquitySharesOutstanding = {
          equityId: equityInfo.id,
          sharesOutstanding: equity.sharesOutstanding,
          endDate: null,
          startDate: null,
          id: undefined
        };
        return Promise.all([
          equityInfo,
          this.equitySharesOutstanding.post(equitySharesOutstanding)
        ]);
      })
      .then(equityDetails => {
        equityDetails[0].sharesOutstanding = equityDetails[1].sharesOutstanding;
        return equityDetails[0];
      });
  }

  protected putAsset(equity: Equity): Promise<Equity> {
    return this.equityService.putEquity(equity);
  }

  protected resetAssetForm(equity: Equity, form: FormGroup): void {
    form.patchValue({
      asset: {
        dividendFrequencyId: equity.dividendFrequencyId,
        dividendRate: equity.dividendRate,
        sharesOutstanding: equity.sharesOutstanding
      }
    });
  }
}
