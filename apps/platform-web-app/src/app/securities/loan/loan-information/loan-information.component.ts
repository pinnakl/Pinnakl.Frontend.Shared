import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { Loan } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import { LoanService } from '@pnkl-frontend/shared';
import { MarketService } from '@pnkl-frontend/shared';
import { PublicIdentifierService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../../shared/securities-helper.service';
import { SecurityInformationComponent } from '../../shared/security-information.component';

@Component({
  selector: 'loan-information',
  templateUrl: 'loan-information.component.html'
})
export class LoanInformationComponent extends SecurityInformationComponent {
  @Input() couponTypes: SecurityAttributeOption[];
  @Input() interestBasisOptions: SecurityAttributeOption[];
  @Input() paymentFrequencyOptions: SecurityAttributeOption[];

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
    private readonly loanService: LoanService
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

  protected createAssetForm(loan: Loan, fb: FormBuilder): FormGroup {
    if (!loan) {
      return fb.group({
        accruingIndicator: [],
        couponRate: [, Validators.required],
        couponTypeId: [, Validators.required],
        firstCouponDate: [],
        interestBasisId: [, Validators.required],
        maturityDate: [, Validators.required],
        outstandingAmount: [],
        paymentFrequencyId: [, Validators.required]
      });
    }
    return fb.group({
      accruingIndicator: [loan.accruingIndicator],
      couponRate: [loan.couponRate, Validators.required],
      couponTypeId: [loan.couponTypeId, Validators.required],
      firstCouponDate: [loan.firstCouponDate],
      interestBasisId: [loan.interestBasisId, Validators.required],
      maturityDate: [loan.maturityDate, Validators.required],
      outstandingAmount: [loan.outstandingAmount],
      paymentFrequencyId: [loan.paymentFrequencyId, Validators.required]
    });
  }

  protected getUpdatedAsset(entity: Loan, existingEntity: Loan): Loan {
    const updatedEntity = {} as Loan;
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
    const maturityDate = entity.maturityDate;
    if (!this.utility.compareDates(maturityDate, existingEntity.maturityDate)) {
      updatedEntity.maturityDate = maturityDate;
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
    if (_.isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.id = existingEntity.id;
    return updatedEntity;
  }

  protected postAsset(loan: Loan): Promise<Loan> {
    return this.loanService.postLoan(loan);
  }

  protected putAsset(loan: Loan): Promise<Loan> {
    return this.loanService.putLoan(loan);
  }

  protected resetAssetForm(loan: Loan, form: FormGroup): void {
    form.patchValue({
      asset: {
        accruingIndicator: loan.accruingIndicator,
        couponRate: loan.couponRate,
        couponTypeId: loan.couponTypeId,
        firstCouponDate: loan.firstCouponDate,
        interestBasisId: loan.interestBasisId,
        maturityDate: loan.maturityDate,
        outstandingAmount: loan.outstandingAmount,
        paymentFrequencyId: loan.paymentFrequencyId
      }
    });
  }
}
