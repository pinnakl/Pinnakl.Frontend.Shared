import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PinnaklSpinner, Toastr } from '@pnkl-frontend/core';
import {
  Bond,
  BondCoupon,
  BondCouponService,
  BondService,
  MarketService,
  PublicIdentifierService,
  SecurityAttributeOption,
  SecurityService,
  Utility
} from '@pnkl-frontend/shared';
import * as _ from 'lodash';
import { SecuritiesHelper } from '../../shared/securities-helper.service';
import { SecurityInformationComponent } from '../../shared/security-information.component';

@Component({
  selector: 'bond-information',
  templateUrl: 'bond-information.component.html'
})
export class BondInformationComponent extends SecurityInformationComponent {
  @Input() couponTypes: SecurityAttributeOption[];
  @Input() interestBasisOptions: SecurityAttributeOption[];
  @Input() paymentFrequencyOptions: SecurityAttributeOption[];

  asset: { couponRate: number; id: number; securityId: number };
  couponRateManagerVisible = false;

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
    private readonly bondService: BondService,
    private readonly bondCouponService: BondCouponService
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

  protected createAssetForm(bond: Bond, fb: FormBuilder): FormGroup {
    if (!bond) {
      return fb.group({
        accruingIndicator: [],
        couponRate: [, Validators.required],
        couponTypeId: [, Validators.required],
        firstAccrualDate: [],
        firstCouponDate: [],
        interestBasisId: [, Validators.required],
        issueAmount: [],
        maturityDate: [, Validators.required],
        minPiece: [, Validators.required],
        nominalValue: [, Validators.required],
        outstandingAmount: [],
        paymentFrequencyId: [, Validators.required],
        principalFactor: []
      });
    }
    return fb.group({
      accruingIndicator: [bond.accruingIndicator],
      couponRate: [bond.couponRate, Validators.required],
      couponTypeId: [bond.couponTypeId, Validators.required],
      firstAccrualDate: [bond.firstAccrualDate],
      firstCouponDate: [bond.firstCouponDate],
      interestBasisId: [bond.interestBasisId, Validators.required],
      issueAmount: [bond.issueAmount],
      maturityDate: [bond.maturityDate, Validators.required],
      minPiece: [bond.minPiece, Validators.required],
      nominalValue: [bond.nominalValue, Validators.required],
      outstandingAmount: [bond.outstandingAmount],
      paymentFrequencyId: [bond.paymentFrequencyId, Validators.required],
      principalFactor: [bond.principalFactor]
    });
  }

  protected getUpdatedAsset(entity: Bond, existingEntity: Bond): Bond {
    const updatedEntity = {} as Bond;
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
    const issueAmount = entity.issueAmount;
    if (!this.utility.compareNumeric(issueAmount, existingEntity.issueAmount)) {
      updatedEntity.issueAmount = issueAmount;
    }
    const maturityDate = entity.maturityDate;
    if (!this.utility.compareDates(maturityDate, existingEntity.maturityDate)) {
      updatedEntity.maturityDate = maturityDate;
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
    const paymentFrequencyId = entity.paymentFrequencyId;
    if (
      !this.utility.compareNumeric(
        paymentFrequencyId,
        existingEntity.paymentFrequencyId
      )
    ) {
      updatedEntity.paymentFrequencyId = paymentFrequencyId;
    }
    const principalFactor = entity.principalFactor;
    if (
      !this.utility.compareNumeric(
        principalFactor,
        existingEntity.principalFactor
      )
    ) {
      updatedEntity.principalFactor = principalFactor;
    }
    if (_.isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.id = existingEntity.id;
    return updatedEntity;
  }

  protected postAsset(bond: Bond): Promise<Bond> {
    return this.bondService
      .postBond(bond)
      .then(bondInfo => {
        const bondCoupon: BondCoupon = {
          bondId: bondInfo.id,
          coupon: bond.couponRate,
          endDate: null,
          startDate: null,
          id: undefined
        };
        return Promise.all([bondInfo, this.bondCouponService.post(bondCoupon)]);
      })
      .then(bondDetails => {
        bondDetails[0].couponRate = bondDetails[1].coupon;
        return bondDetails[0];
      });
  }

  protected putAsset(bond: Bond): Promise<Bond> {
    return this.bondService.putBond(bond);
  }

  protected resetAssetForm(bond: Bond, form: FormGroup): void {
    form.patchValue({
      asset: {
        accruingIndicator: bond.accruingIndicator,
        couponRate: bond.couponRate,
        couponTypeId: bond.couponTypeId,
        firstAccrualDate: bond.firstAccrualDate,
        firstCouponDate: bond.firstCouponDate,
        interestBasisId: bond.interestBasisId,
        issueAmount: bond.issueAmount,
        maturityDate: bond.maturityDate,
        minPiece: bond.minPiece,
        nominalValue: bond.nominalValue,
        outstandingAmount: bond.outstandingAmount,
        paymentFrequencyId: bond.paymentFrequencyId,
        principalFactor: bond.principalFactor
      }
    });
  }

  onCouponValueChange(couponRate: number): void {
    this.asset.couponRate = couponRate;
  }
}
