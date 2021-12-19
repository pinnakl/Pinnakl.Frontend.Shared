import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { MarketService } from '@pnkl-frontend/shared';
import { PublicIdentifierService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { PeLoan } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import * as _ from 'lodash';
import { SecuritiesHelper } from '../../shared/securities-helper.service';
import { SecurityInformationComponent } from '../../shared/security-information.component';
import { PeloanService } from '../peloan.service';
@Component({
  selector: 'peloan-information',
  templateUrl: './peloan-information.component.html',
  styleUrls: ['./peloan-information.component.scss']
})
export class PeloanInformationComponent extends SecurityInformationComponent {
  @Input() couponTypes: SecurityAttributeOption[];
  @Input() interestBasisOptions: SecurityAttributeOption[];
  @Input() paymentFrequencyOptions: SecurityAttributeOption[];
  statusTypes = ['Delinquent', 'current ', 'written-off'];
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
    private readonly peloanService: PeloanService
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

  protected createAssetForm(peLoan: PeLoan, fb: FormBuilder): FormGroup {
    if (!peLoan) {
      return fb.group({
        accruingIndicator: [],
        couponRate: [, Validators.required],
        couponTypeId: [, Validators.required],
        firstAccrualDate: [],
        firstCouponDate: [],
        interestBasisId: [, Validators.required],
        faceAmount: [],
        maturityDate: [, Validators.required],
        creditQuality: [],
        status: [],
        geography: [],
        paymentFrequencyId: [, Validators.required]
      });
    }
    return fb.group({
      accruingIndicator: [peLoan.accruingIndicator],
      couponRate: [peLoan.couponRate, Validators.required],
      couponTypeId: [peLoan.couponTypeId, Validators.required],
      firstAccrualDate: [peLoan.firstAccrualDate],
      firstCouponDate: [peLoan.firstCouponDate],
      interestBasisId: [peLoan.interestBasisId, Validators.required],
      faceAmount: [peLoan.faceAmount],
      maturityDate: [peLoan.maturityDate, Validators.required],
      creditQuality: [peLoan.creditQuality],
      status: [peLoan.status],
      geography: [peLoan.geography],
      paymentFrequencyId: [peLoan.paymentFrequencyId, Validators.required]
    });
  }

  protected getUpdatedAsset(entity: PeLoan, existingEntity: PeLoan): PeLoan {
    const updatedEntity = {} as PeLoan;
    const accruingIndicator = !!entity.accruingIndicator;
    if (accruingIndicator !== existingEntity.accruingIndicator) {
      updatedEntity.accruingIndicator = accruingIndicator;
    }
    const couponRate = entity.couponRate;
    if (!this.utility.compareNumeric(couponRate, existingEntity.couponRate)) {
      updatedEntity.couponRate = couponRate;
    }
    const couponTypeId = entity.couponTypeId;
    if (
      !this.utility.compareNumeric(couponTypeId, existingEntity.couponTypeId)
    ) {
      updatedEntity.couponTypeId = couponTypeId;
    }
    const firstAccrualDate = entity.firstAccrualDate;
    if (
      !this.utility.compareDates(
        firstAccrualDate,
        existingEntity.firstAccrualDate
      )
    ) {
      updatedEntity.firstAccrualDate = firstAccrualDate;
    }
    const firstCouponDate = entity.firstCouponDate;
    if (
      !this.utility.compareDates(
        firstCouponDate,
        existingEntity.firstCouponDate
      )
    ) {
      updatedEntity.firstCouponDate = firstCouponDate;
    }
    const interestBasisId = entity.interestBasisId;
    if (
      !this.utility.compareNumeric(
        interestBasisId,
        existingEntity.interestBasisId
      )
    ) {
      updatedEntity.interestBasisId = interestBasisId;
    }
    const faceAmount = entity.faceAmount;
    if (!this.utility.compareNumeric(faceAmount, existingEntity.faceAmount)) {
      updatedEntity.faceAmount = faceAmount;
    }

    const creditQuality = entity.creditQuality;
    if (creditQuality !== existingEntity.creditQuality) {
      updatedEntity.creditQuality = creditQuality;
    }

    const status = entity.status;
    if (status !== existingEntity.status) {
      updatedEntity.status = status;
    }
    const geography = entity.geography;
    if (geography !== existingEntity.geography) {
      updatedEntity.geography = geography;
    }

    const maturityDate = entity.maturityDate;
    if (!this.utility.compareDates(maturityDate, existingEntity.maturityDate)) {
      updatedEntity.maturityDate = maturityDate;
    }
    const paymentFrequencyId = entity.paymentFrequencyId;
    if (
      !this.utility.compareNumeric(
        paymentFrequencyId,
        existingEntity.paymentFrequencyId
      )
    ) {
      updatedEntity.paymentFrequencyId = paymentFrequencyId;
    }
    if (_.isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.id = existingEntity.id;
    return updatedEntity;
  }

  protected postAsset(peLoan: PeLoan): Promise<PeLoan> {
    return this.peloanService.postLoan(peLoan);
  }

  protected putAsset(peLoan: PeLoan): Promise<PeLoan> {
    // return this.bondService.putBond(bond);

    return this.peloanService.putLoan(peLoan);
  }

  protected resetAssetForm(peLoan: PeLoan, form: FormGroup): void {
    form.patchValue({
      asset: {
        accruingIndicator: peLoan.accruingIndicator,
        couponRate: peLoan.couponRate,
        couponTypeId: peLoan.couponTypeId,
        firstAccrualDate: peLoan.firstAccrualDate,
        firstCouponDate: peLoan.firstCouponDate,
        interestBasisId: peLoan.interestBasisId,
        issueAmount: peLoan.faceAmount,
        maturityDate: peLoan.maturityDate,
        paymentFrequencyId: peLoan.paymentFrequencyId,
        faceAmount: peLoan.faceAmount,
        creditQuality: peLoan.creditQuality,
        status: peLoan.status,
        geography: peLoan.geography
      }
    });
  }
}
