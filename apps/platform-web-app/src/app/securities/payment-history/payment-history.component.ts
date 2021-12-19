import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Utility } from '@pnkl-frontend/shared';
import { PeloanService } from '../peloan/peloan.service';
import { SecuritiesHelper } from '../shared/securities-helper.service';
import {
  PaymentHistory,
  PaymentHistoryService
} from './payment-history-backend';
@Component({
  selector: 'payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit {
  form: FormGroup;
  @Input() peLoanId: number;
  paymentHistory: PaymentHistory[];
  cancelConfirmationVisible = false;
  paymentToDelete: number;
  paymentSelected: PaymentHistory;
  constructor(
    private readonly fb: FormBuilder,
    private readonly paymentHistoryService: PaymentHistoryService,
    private readonly peloanService: PeloanService,
    private readonly securitiesHelper: SecuritiesHelper,
    private readonly spinner: PinnaklSpinner,
    private readonly utility: Utility
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      paymentDate: [, Validators.required],
      payment: [, Validators.required],
      principal: [, Validators.required],
      interest: [, Validators.required]
    });
    const securityId =
      this.securitiesHelper.securityDetailsResolvedData &&
      this.securitiesHelper.securityDetailsResolvedData.security
        ? this.securitiesHelper.securityDetailsResolvedData.security.id
        : null;
    if (!this.peLoanId) {
      this.spinner.spin();
      this.peloanService.getPeLoanFromSecurityId(securityId).then(data => {
        this.peLoanId = data.id;
        this.paymentHistoryService
          .getPaymentsHistoryFromLoanId(this.peLoanId)
          .then(paymentHistoryData => {
            this.paymentHistory = paymentHistoryData;
            this.spinner.stop();
          });
      });
    } else {
      this.spinner.spin();
      this.paymentHistoryService
        .getPaymentsHistoryFromLoanId(this.peLoanId)
        .then(data => {
          this.paymentHistory = data;
          this.spinner.stop();
        });
    }
  }

  onSubmit(): void {
    if (this.paymentSelected) {
      this.putPaymenHistory();
    } else {
      this.postPaymentHistory();
    }
  }

  postPaymentHistory(): void {
    if (this.form.valid) {
      const formValue: {
        paymentDate: Date;
        payment: number;
        principal: number;
        interest: number;
        peLoanId?: number;
      } = this.form.value;

      formValue.peLoanId = this.peLoanId;
      this.spinner.spin();
      this.paymentHistoryService.post(formValue).then(data => {
        if (this.paymentHistory && this.paymentHistory.length) {
          this.paymentHistory = [...this.paymentHistory, data];
        } else {
          this.paymentHistory = [data];
        }

        this.paymentSelected = null;
        this.form.patchValue({
          paymentDate: null,
          payment: null,
          principal: null,
          interest: null
        });
        this.spinner.stop();
      });
    }
  }

  putPaymenHistory(): void {
    const formValue: {
      paymentDate: Date;
      payment: number;
      principal: number;
      interest: number;
    } = this.form.value;
    const existingPayment: PaymentHistory = this.paymentSelected;

    const putRequestPayload: {
      paymentDate?: Date;
      payment?: number;
      principal?: number;
      interest?: number;
      id: number;
    } = {} as {
      paymentDate?: Date;
      payment?: number;
      principal?: number;
      interest?: number;
      id: number;
    };

    if (
      !this.utility.compareDates(
        existingPayment.paymentDate,
        formValue.paymentDate
      )
    ) {
      putRequestPayload.paymentDate = formValue.paymentDate;
    }

    if (
      !this.utility.compareNumeric(existingPayment.payment, formValue.payment)
    ) {
      putRequestPayload.payment = formValue.payment;
    }

    if (
      !this.utility.compareNumeric(existingPayment.interest, formValue.interest)
    ) {
      putRequestPayload.interest = formValue.interest;
    }

    if (
      !this.utility.compareNumeric(
        existingPayment.principal,
        formValue.principal
      )
    ) {
      putRequestPayload.principal = formValue.principal;
    }

    putRequestPayload.id = existingPayment.id;

    this.spinner.spin();
    this.paymentHistoryService.put(putRequestPayload).then(data => {
      this.paymentHistory = this.paymentHistory.map(item => {
        if (item.id === data.id) {
          return data;
        } else {
          return item;
        }
      });
      this.paymentSelected = null;
      this.form.patchValue({
        paymentDate: null,
        payment: null,
        principal: null,
        interest: null
      });
      this.spinner.stop();
    });
  }

  deletePayment(paymentId: number): void {
    this.paymentToDelete = paymentId;
    this.cancelConfirmationVisible = true;
  }

  deletePaymentConfirmed(): void {
    this.spinner.spin();
    this.paymentHistoryService.delete(this.paymentToDelete).then(() => {
      this.paymentHistory = this.paymentHistory.filter(payment => {
        if (payment.id !== this.paymentToDelete) {
          return payment;
        }
      });
      this.cancelConfirmationVisible = false;
      this.spinner.stop();
    });
  }

  cancelDeletion(): void {
    this.paymentToDelete = null;
    this.cancelConfirmationVisible = false;
  }

  editPayment(payment: PaymentHistory): void {
    this.paymentSelected = payment;
    this.form.patchValue({
      paymentDate: payment.paymentDate,
      payment: payment.payment,
      principal: payment.principal,
      interest: payment.interest
    });
  }

  cancelEditClicked(): void {
    this.paymentSelected = null;
    this.form.patchValue({
      paymentDate: null,
      payment: null,
      principal: null,
      interest: null
    });
  }
}
