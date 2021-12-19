import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Observable, Subscription } from 'rxjs';

import { GridOptions } from 'ag-grid-community';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import {
  Broker,
  Destroyable,
  PositionService,
  RebalanceService,
  Security
} from '@pnkl-frontend/shared';
import { takeUntil } from 'rxjs/operators';
import { PortfolioRebalanceComponent } from '../portfolio-rebalance/portfolio-rebalance';

declare let $: any;

@Component({
  selector: 'position-popup',
  templateUrl: './position-popup.component.html',
  styleUrls: ['./position-popup.component.scss']
})
export class PositionPopupComponent
  extends Destroyable
  implements OnDestroy, OnInit{
  @Input() accounts: any;
  @Input() brokers: Broker[];
  @Input() funds: any;
  @Input() securities: Security[] = [];
  @Input() secId: any = {};
  @Input() underlyingSecId: any = {};
  @Input() private openPortfolioModal: Observable<void>;
  @Input() private openPositionEditModal: Observable<void>;
  @Input() private openPositionSummaryModal: Observable<void>;
  @Output() private positionEditModalClosed = new EventEmitter<void>();

  rebalancedData: any;
  columns: string[] = [];
  filterVisible = false;
  aggregateMVUSD = 0;
  aggregateMVUSDPct = 0;
  hidePortfolioIvDvModal = true;
  hidePortfolioMenuModal = true;
  hideRebalancedModal = true;
  hidePortfolioRebalModal = true;
  hidePositionEditModal = true;
  hidePositionModal = true;
  modalOpen = false;
  tradeHistoryTab = false;
  positionVsPriceTab = false;
  priceComparisonTab = false;
  positionSummaryTab = false;
  // positionMoveTab = false;
  // pAndLTab = false;
  paymentHistoryTab = false;
  amortScheduleTab = false;
  loansTab = false;
  tabActive: string;
  positionEditPopup = false;
  form: FormGroup;
  accountForm: FormGroup;
  portfolioMenuForm: FormGroup;
  submitted = false;
  rebalancedGridOptions: GridOptions;
  rebalancedDefs: any[];
  autoGroupColumnDef: any;
  remcolumn: any;
  rebalance: boolean;
  tradedate: Date;
  configVisible = false;
  tabs: { caption: string; name: string }[];
  securityDescription: string;

  @ViewChild(PortfolioRebalanceComponent, { static: true }) rebalComp;

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly rebalanceService: RebalanceService,
    private readonly spinner: PinnaklSpinner,
    private readonly positionService: PositionService
  ) {
    super();
    this.rebalancedGridOptions = {
      context: {
        componentParent: this
      },
      onGridReady: params => {
        setTimeout(() => {
          params.api.selectAll();
          params.api.sizeColumnsToFit();
        }, 10);
      },
      animateRows: true,
      groupDefaultExpanded: 1,
      rowSelection: 'multiple',
      groupSelectsChildren: true,
      getRowStyle: this.setRowStyle
    };

    this.autoGroupColumnDef = {
      headerName: 'Tr Type',
      field: 'trantype',
      cellRendererParams: {
        suppressCount: true,
        checkbox: true,
        innerRenderer: this.groupTitle
      },
      maxWidth: 120
    };

    this.rebalancedDefs = [
      {
        headerName: 'Security Id',
        field: 'securityid',
        hide: true,
        rowGroup: true
      },
      {
        headerName: 'Tr Type',
        field: 'trantype',
        hide: true
      },
      {
        headerName: 'Account',
        field: 'accountcode',
        minWidth: 80
      },
      {
        headerName: 'AssetType',
        field: 'assettype',
        minWidth: 90,
        cellRenderer: this.toUpperCase
      },
      {
        headerName: 'Ticker',
        field: 'ticker',
        minWidth: 70
      },
      {
        headerName: 'Identifier',
        field: 'identifier',
        minWidth: 90
      },
      {
        headerName: 'Description',
        field: 'description',
        minWidth: 300
      },
      {
        headerName: 'Quantity',
        field: 'quantity',
        minWidth: 120,
        cellClass: 'grid-align',
        cellRenderer: this.showInt,
        pinnedRowCellRenderer: this.pinnedRowCellRendererWithCommas
      },
      {
        headerName: 'Price',
        field: 'price',
        minWidth: 120,
        cellClass: 'grid-align',
        cellRenderer: this.fixDecimalAndCommas,
        pinnedRowCellRenderer: this.pinnedRowCellRendererWithCommas
      },
      {
        headerName: 'Validation',
        field: 'validation',
        minWidth: 80,
        cellRenderer: this.setValidationIcon
        // checkboxSelection: this.decideCheckbox
      }
    ];
  }

  formattedPosDate(): string {
    return moment().format('MM/DD/YYYY');
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  ngOnInit(): void {
    this.tabs = [
      { caption: 'POSITION SUMMARY', name: 'positionSummaryTab' },
      { caption: 'TRADE HISTORY', name: 'tradeHistoryTab' },
      { caption: 'POSITION HISTORY', name: 'positionVsPriceTab' },
      { caption: 'PRICE COMPARISON', name: 'priceComparisonTab' }
      // { caption: 'POSITION MOVE', name: 'positionMoveTab' },
      // { caption: 'P&L', name: 'pAndLTab' }
    ];

    this.form = this.fb.group({
      securityId: [null, Validators.required]
    });
    this.accountForm = this.fb.group({
      account: null
    });
    this.portfolioMenuForm = this.fb.group({
      selectedType: [null, Validators.required]
    });
    if (this.openPositionEditModal) {
      this.subscriptions.push(
        this.openPositionEditModal.subscribe(() =>
          this.togglePositionEditModal()
        )
      );
      this.subscriptions = [
        this.openPortfolioModal.subscribe(() =>
          this.togglePortfolioMenuModal()
        ),
        this.openPositionEditModal.subscribe(() =>
          this.togglePositionEditModal()
        ),
        this.openPositionSummaryModal.subscribe(() =>
          this._openPositionSummaryModal()
        )
      ];
    }
    this.watchAccountsForm();
  }

  private watchAccountsForm(): void {
    this.accountForm
      .get('account')
      .valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe(account =>
        this.positionService.selectedPositionPopupAccount$.next(account)
      );
  }

  closePositionEditModal(): void {
    this.hidePositionEditModal = true;
    this.positionEditPopup = false;
    this._hideModal();
  }

  setValidationIcon(params: any): string {
    if (params && params.data) {
      return '<i class="icon-pinnakl-ok text-success"></i>';
    } else {
      return '';
    }
  }

  closePositionModal(): void {
    this.modalOpen = false;
    // this.selectedGridRow = {};
    this.resetTabsValues();
    this.hidePositionModal = true;
    this.positionService.selectedPositionPopupAccount$.next(null);
    this._hideModal();
  }

  closePortMenuModal(): void {
    this.modalOpen = false;
    this.hidePortfolioMenuModal = true;
    this.portfolioMenuForm.reset();
    if (this.rebalance === true) {
      this.rebalComp.reset();
      this.rebalance = false;
    } else if (this.rebalance === false) {
      this.rebalance = false;
    }
    this._hideModal();
  }

  closePortOptionsModal(): void {
    this.modalOpen = false;
    this.rebalance
      ? (this.hidePortfolioRebalModal = true)
      : (this.hidePortfolioIvDvModal = true);

    if (this.rebalance) {
      this.rebalComp.reset();
    }
    this.portfolioMenuForm.reset();
    this.rebalance = false;
    this._hideModal();
  }

  closeRebalancedModal(): void {
    this.modalOpen = false;
    this.hideRebalancedModal = true;
    if (this.rebalance) {
      this.rebalComp.reset();
    }
    this.portfolioMenuForm.reset();
    this.rebalance = false;
    this._hideModal();
  }

  activateTab(tabValue: string): void {
    this.tabActive = tabValue;
    this[tabValue] = true;
  }

  resetTabsValues(): void {
    this.tradeHistoryTab = false;
    this.positionVsPriceTab = false;
    this.priceComparisonTab = false;
    this.positionSummaryTab = false;
    // this.positionMoveTab = false;
    // this.pAndLTab = false;
    this.paymentHistoryTab = false;
    this.amortScheduleTab = false;
  }

  togglePositionEditModal(): void {
    this.positionEditPopup = true;
    if (this.positionEditPopup) {
      this.hidePositionEditModal = false;
    }
  }

  togglePortfolioMenuModal(): void {
    this.hidePortfolioMenuModal = false;
  }

  showPositionPopup(form: FormGroup): void {
    if (!form.valid) {
      return;
    }
    const selectedSecurity = this.securities.find(
      security => security.id === form.value.securityId.id
    );
    // this.selectedGridRow = {};
    // this.selectedGridRow.securityId = selectedSecurity.id;
    // this.selectedGridRow.description = selectedSecurity.description;
    this.secId = selectedSecurity.id;
    this.underlyingSecId = selectedSecurity.underlyingsecid;
    this.securityDescription = selectedSecurity.description;
    this.modalOpen = true;
    this.form.reset();
    this.activateTab('positionSummaryTab');
    this.hidePositionEditModal = true;
    this.hidePositionModal = false;
  }

  showAdjustPopup(portfolioMenuForm: FormGroup): void {
    if (!portfolioMenuForm.valid) {
      return;
    }
    this.rebalance = this.portfolioMenuForm.controls['selectedType'].value;
    this.modalOpen = true;
    this.hidePortfolioMenuModal = true;
    this.rebalance
      ? (this.hidePortfolioRebalModal = false)
      : (this.hidePortfolioIvDvModal = false);
    if (!this.rebalance) {
      this.rebalComp.reset();
    }
    this.rebalComp.setGridData();
  }

  getRebalanced(rebalanceRequest: any): void {
    this.spinner.spin();
    if (rebalanceRequest.options.valid) {
      this.tradedate = rebalanceRequest.options.controls['date'].value;
      const brokerId = rebalanceRequest.options.controls['brokersId'].value;
      if (this.rebalance) {
        this.rebalanceService
          .postRebalancedData(this.tradedate, brokerId)
          .then(this.getRebalancedData.bind(this))
          .then(this.showRebalancedGrid.bind(this));
      } else {
        const cashflow = rebalanceRequest.options.controls['cashFlow'].value;
        this.rebalanceService
          .postIvDvData(this.tradedate, brokerId, cashflow)
          .then(this.getIvDvData.bind(this))
          .then(this.showRebalancedGrid.bind(this));
      }
    }
  }

  getRebalancedData(requestId: string): any {
    return this.rebalanceService.getRebalancedData(this.tradedate);
  }

  getIvDvData(requestId: string): any {
    return this.rebalanceService.getIvDvData(this.tradedate);
  }

  showRebalancedGrid(rebalanceddata: any[]): void {
    this.rebalancedData = rebalanceddata;
    setTimeout(() => {
      this.rebalancedGridOptions.api.selectAll();
      this.rebalancedGridOptions.api.sizeColumnsToFit();
    }, 10);
    this.spinner.stop();
    this.modalOpen = true;
    this.rebalance
      ? (this.hidePortfolioRebalModal = true)
      : (this.hidePortfolioIvDvModal = true);
    this.hideRebalancedModal = false;
  }

  goback(id: string): void {
    if (id === 'rebalancedback') {
      this.hideRebalancedModal = true;
      this.rebalance
        ? (this.hidePortfolioRebalModal = false)
        : (this.hidePortfolioIvDvModal = false);
    } else if (id === 'optionsback') {
      this.rebalance
        ? (this.hidePortfolioRebalModal = true)
        : (this.hidePortfolioIvDvModal = true);
      this.hidePortfolioMenuModal = false;
    }
  }

  reset(): void {
    setTimeout(() => {
      this.rebalancedGridOptions.api.selectAll();
      this.rebalancedGridOptions.api.sizeColumnsToFit();
    }, 10);
  }

  private fixDecimalAndCommas(params: any): string {
    if (params && params.value) {
      const value = parseFloat(params.value);
      const valuestring = value.toFixed(3);
      return valuestring.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else {
      return '';
    }
  }

  private groupTitle(params: any): string {
    if (params && params.value) {
      if (params.value !== 'B' && params.value !== 'S') {
        return params.node.allLeafChildren[0].data.ticker;
      } else if (params.value === 'B' || params.value === 'S') {
        return params.data.trantype;
      }
    } else {
      return '';
    }
  }

  private _openPositionSummaryModal(): void {
    this.modalOpen = true;
    this.hidePositionModal = false;
    this.activateTab(this.tabs[0].name);
  }

  private pinnedRowCellRendererWithCommas(params: any): string {
    const finalValue =
      (params.value &&
        params.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')) ||
      params.value;
    return `<b>${finalValue}</b>`;
  }

  private showInt(params: any): string {
    if (params && params.value) {
      const value = parseFloat(params.value);
      const valuestring = value.toFixed(0);
      return valuestring.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else {
      return '';
    }
  }

  private setRowStyle(params: any): { background: string } {
    if (params.data) {
      return { background: 'white' };
    } else {
      return { background: '#E7EDFD' };
    }
  }

  private toUpperCase(params: any): string {
    if (params && params.value) {
      return params.value.toString().toUpperCase();
    } else {
      return '';
    }
  }

  private _hideModal(): void {
    if (!this.modalOpen) {
      this.positionEditModalClosed.emit();
    }
  }
}
