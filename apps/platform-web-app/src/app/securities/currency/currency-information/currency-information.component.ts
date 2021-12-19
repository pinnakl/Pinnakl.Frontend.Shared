import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { Currency } from '@pnkl-frontend/shared';
import { CurrencyService } from '@pnkl-frontend/shared';
import { MarketService } from '@pnkl-frontend/shared';
import { PublicIdentifierService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../../shared/securities-helper.service';
import { SecurityInformationComponent } from '../../shared/security-information.component';

@Component({
  selector: 'currency-information',
  templateUrl: 'currency-information.component.html'
})
export class CurrencyInformationComponent extends SecurityInformationComponent {
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
    private readonly currencyService: CurrencyService
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

  protected createAssetForm(currency: Currency, fb: FormBuilder): FormGroup {
    if (!currency) {
      return fb.group({
        forwardPrice: [],
        maturity: [, Validators.required],
        secondaryCurrencyId: [, Validators.required]
      });
    }
    return fb.group({
      forwardPrice: [currency.forwardPrice],
      maturity: [currency.maturity, Validators.required],
      secondaryCurrencyId: [currency.secondaryCurrencyId, Validators.required]
    });
  }

  protected getUpdatedAsset(
    entity: Currency,
    existingEntity: Currency
  ): Currency {
    const updatedEntity = {} as Currency;
    const forwardPrice = entity.forwardPrice;
    if (
      !this.utility.compareNumeric(forwardPrice, existingEntity.forwardPrice)
    ) {
      updatedEntity.forwardPrice = forwardPrice;
    }
    const maturity = entity.maturity;
    if (!this.utility.compareDates(maturity, existingEntity.maturity)) {
      updatedEntity.maturity = maturity;
    }
    const secondaryCurrencyId = entity.secondaryCurrencyId;
    if (
      !this.utility.compareNumeric(
        secondaryCurrencyId,
        existingEntity.secondaryCurrencyId
      )
    ) {
      updatedEntity.secondaryCurrencyId = secondaryCurrencyId;
    }
    if (_.isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.id = existingEntity.id;
    return updatedEntity;
  }

  protected postAsset(asset: Currency): Promise<Currency> {
    return this.currencyService.postCurrency(asset);
  }

  protected putAsset(asset: Currency): Promise<Currency> {
    return this.currencyService.putCurrency(asset);
  }

  protected resetAssetForm(asset: Currency, form: FormGroup): void {
    form.patchValue({
      asset: {
        forwardPrice: asset.forwardPrice,
        maturity: asset.maturity,
        secondaryCurrencyId: asset.secondaryCurrencyId
      }
    });
  }
}
