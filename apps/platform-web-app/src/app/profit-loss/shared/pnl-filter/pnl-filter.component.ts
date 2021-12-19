import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Account } from '@pnkl-frontend/shared';
import { AssetType } from '@pnkl-frontend/shared';
import { PnlService } from '@pnkl-frontend/shared';

@Component({
  selector: 'pnl-filter',
  templateUrl: './pnl-filter.component.html',
  styleUrls: ['pnl-filter.component.scss'],
  animations: [
    trigger('filterVisibleChanged', [
      state('1', style({ transform: 'translateX(-103%)' })),
      state('0', style({ transform: 'translateX(0)' })),
      transition('* => *', animate('500ms'))
    ])
  ]
})
export class PnlFilterComponent implements OnInit {
  @Input() accounts: Account[];
  @Input() disableDates = false;
  @Input() filterVisible: boolean;
  @Input() pnlStartDate: Date;
  @Input() pnlEndDate: Date;
  @Input() assetTypes: Array<AssetType>;
  @Input() isDiscardedSecuritesVisible = false;
  @Input() isStartDateVisible = false;
  @Input() selectedAccount: Account;
  @Output() onApply: EventEmitter<any> = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();
  submitted = false;
  form: FormGroup;
  defaultdate: Date;

  constructor(
    private readonly fb: FormBuilder,
    private readonly spinner: PinnaklSpinner,
    private readonly pnlService: PnlService
  ) {}

  ngOnInit(): void {
    this.accounts = this.accounts.map(acct => ({
      ...acct,
      accountCode: acct.accountCode.toUpperCase()
    }));
    if (this.assetTypes) {
      this.assetTypes = this.assetTypes.map(x => {
        x.assetType = x.assetType.toUpperCase();
        return x;
      });
    }
    this.form = this.fb.group({
      pnlStartDate: [this.disableDates ? new Date() : this.pnlStartDate, Validators.required],
      pnlEndDate: [this.disableDates ? new Date() : this.pnlEndDate, Validators.required],
      accountId: [
        this.selectedAccount ? this.selectedAccount.id : null,
        Validators.required
      ],
      selectedAssetType: [],
      viewDiscarded: []
    });
    if (!this.selectedAccount) {
      return;
    }
  }

  onFilter(): void {
    if (this.form.valid) {
      this.submitted = true;
      this.onApply.emit({
        startDate: this.form.value.pnlStartDate,
        endDate: this.form.value.pnlEndDate,
        viewDiscarded: this.form.value.viewDiscarded,
        account: this.accounts.find(x => x.id === this.form.value.accountId),
        assetType: this.form.value.selectedAssetType
      });
    }
  }

  setDefaultForm(date: any): void {
    this.defaultdate = this.pnlStartDate
      ? this.pnlEndDate
      : date
      ? new Date(date)
      : null;
    this.form.reset();
    this.form.patchValue({
      pnlStartDate: new Date(),
      pnlEndDate: this.defaultdate,
      accountId: this.accounts.filter(p => p.orderOfImportance === '1')[0].id,
      selectedAssetType: null
    });
  }

  onReset(): void {
    this.spinner.spin();
    this.pnlService
      .getLastRunPnlDateByAccount(
        this.accounts.filter(p => p.orderOfImportance === '1')[0].accountCode
      )
      .then(date => {
        this.spinner.stop();
        this.setDefaultForm(date);
      });
  }
}
