import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { Cds } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import { CdsService } from '@pnkl-frontend/shared';
import { MarketService } from '@pnkl-frontend/shared';
import { PublicIdentifierService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import * as _ from 'lodash';
import { SecuritiesHelper } from '../../shared/securities-helper.service';
import { SecurityInformationComponent } from '../../shared/security-information.component';

@Component({
  selector: 'cds-information',
  templateUrl: './cds-information.component.html'
})
export class CdsInformationComponent extends SecurityInformationComponent {
  @Input() paymentFrequencyOptions: SecurityAttributeOption[];
  @Input() businessDaysOptions: string[];
  @Input() businessDayConvention: string[];
  @Input() fixedRateDayCount: string[];
  allowCustom = true;
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
    private readonly cdsService: CdsService
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

  protected createAssetForm(cds: Cds, fb: FormBuilder): FormGroup {
    if (!cds) {
      return fb.group({
        spread: [],
        terminationDate: [],
        paymentFrequency: [],
        businessDays: [],
        businessDayConvention: [],
        fixedRateDayCount: [],
        firstPaymentDate: [],
        underlyingCusip: []
      });
    }
    return fb.group({
      spread: [cds.spread],
      terminationDate: [cds.terminationDate],
      paymentFrequency: [cds.paymentFrequency],
      businessDays: [cds.businessDays],
      businessDayConvention: [cds.businessDayConvention],
      fixedRateDayCount: [cds.fixedRateDayCount],
      firstPaymentDate: [cds.firstPaymentDate],
      underlyingCusip: [cds.underlyingCusip]
    });
  }

  protected getUpdatedAsset(entity: Cds, existingEntity: Cds): Cds {
    const updatedEntity = {} as Cds;
    const businessDayConvention = entity.businessDayConvention,
      businessDays = entity.businessDays,
      firstPaymentDate = entity.firstPaymentDate,
      fixedRateDayCount = entity.fixedRateDayCount,
      paymentFrequency = entity.paymentFrequency,
      spread = entity.spread,
      terminationDate = entity.terminationDate,
      underlyingCusip = entity.underlyingCusip;

    if (businessDayConvention !== existingEntity.businessDayConvention) {
      updatedEntity.businessDayConvention = businessDayConvention;
    }

    if (businessDays !== existingEntity.businessDays) {
      updatedEntity.businessDays = businessDays;
    }

    if (
      !this.utility.compareDates(
        firstPaymentDate,
        existingEntity.firstPaymentDate
      )
    ) {
      updatedEntity.firstPaymentDate = firstPaymentDate;
    }

    if (fixedRateDayCount !== existingEntity.fixedRateDayCount) {
      updatedEntity.fixedRateDayCount = fixedRateDayCount;
    }

    if (
      !this.utility.compareNumeric(
        paymentFrequency,
        existingEntity.paymentFrequency
      )
    ) {
      updatedEntity.paymentFrequency = paymentFrequency;
    }

    if (!this.utility.compareNumeric(spread, existingEntity.spread)) {
      updatedEntity.spread = spread;
    }

    if (
      !this.utility.compareDates(
        terminationDate,
        existingEntity.terminationDate
      )
    ) {
      updatedEntity.terminationDate = terminationDate;
    }

    if (underlyingCusip !== existingEntity.underlyingCusip) {
      updatedEntity.underlyingCusip = underlyingCusip;
    }

    if (_.isEqual(updatedEntity, {})) {
      return null;
    }

    updatedEntity.id = existingEntity.id;

    return updatedEntity;
  }

  protected postAsset(cds: Cds): Promise<Cds> {
    return this.cdsService.postCds(cds);
  }

  protected putAsset(cds: Cds): Promise<Cds> {
    return this.cdsService.putCds(cds);
  }

  protected resetAssetForm(cds: Cds, form: FormGroup): void {
    form.patchValue({
      asset: {
        spread: cds.spread,
        terminationDate: cds.terminationDate,
        paymentFrequency: cds.paymentFrequency,
        businessDays: cds.businessDays,
        businessDayConvention: cds.businessDayConvention,
        fixedRateDayCount: cds.fixedRateDayCount,
        firstPaymentDate: cds.firstPaymentDate,
        underlyingCusip: cds.underlyingCusip
      }
    });
  }
}
