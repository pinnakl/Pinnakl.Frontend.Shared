import { moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PageSubscriptionsHandler } from '@pnkl-frontend/core';
import { PinnaklSpinner, Toastr } from '@pnkl-frontend/core';
import {
  Account,
  Broker,
  BrokerService,
  Fund,
  PositionsPnlValueModel,
  RebalanceService,
  Security,
  SecurityService,
  TradeWorkflowSpecsBackendStateFacade
} from '@pnkl-frontend/shared';

import { sortBy } from 'lodash';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { concatMap, first, map } from 'rxjs/operators';
import { PositionsBackendStateFacade } from '../../positions-backend-state/positions-backend-state-facade.service';
import { PositionsPnlValuesSavingService } from '../../positions-backend-state/positions-pnl-values-saving.service';
import { PositionsUiStateFacade } from '../../positions-ui-state/positions-ui-state-facade.service';
import { PositionsHomeSummary } from '../../positions-ui-state/store/positions-home-summary-selected-account/positions-home-summary.model';
import { CashBalanceUI } from '../positions-home-cash-balance/positions-home-cash-balance.component';
import { MarketValueSummary, MarketValueSummaryElement } from '../positions-home-market-value-summary/MarketValueSummary.interface';
import { PMSConfig, PMSConfigType, PmsUserListOrder, PositionHomeService, PresetType, SavePresetFormData } from './position-home.service';

export enum PanelType {
  FILTERS_VISIBLE = 'filterVisible',
  CONFIG_VISIBLE = 'configVisible',
  ALERTS_VISIBLE = 'alertsVisible',
  SEND_TRADES_VISIBLE = 'sendTradesVisible',
}

@Component({
  selector: 'position-home',
  templateUrl: './position-home.component.html',
  styleUrls: ['./position-home.component.scss']
})
export class PositionHomeComponent implements OnDestroy, OnInit {
  brokers: Broker[];
  funds: Fund[];
  configVisible = false;
  filterVisible = false;
  alertsVisible = false;
  rebalanceVisible = false;
  sendTradesVisible = false;
  accounts$: Observable<Account[]>;
  mainAccount$: Observable<Account>;
  filterString: string;
  presetName: string;
  gridSearchText = '';
  openPortfolioModal = new Subject<void>();
  openPositionEditModal = new Subject<void>();
  openPositionSummaryModal = new Subject<void>();
  marketValueSummary$: Observable<MarketValueSummaryElement[]>;
  cashBalance$: Observable<CashBalanceUI[]>;
  positionsPnlValues$: Observable<PositionsPnlValueModel[]>;
  positionsHomeSummary$: Observable<PositionsHomeSummary>;
  selectedGridRow: any = {};
  securities: Security[];
  showPositionPopup = false;
  showPePositionPopup = false;
  showRebalanceMenu = false;
  showResetRebalanceConfirmation = false;
  subscribedToRealtimePortfolio = false;
  saveAsModalShow = false;
  savePresetModalShow = false;
  choosePresetForm: FormGroup;
  taxLotsEnabled = false;
  hideRebalanceOrdersModal = true;
  positionsGridHeight = {
    value: 700,
    sizing: 'px'
  };
  public panelTypes: typeof PanelType = PanelType;
  public requiredEstablishedStreamsReady$: Observable<boolean>;
  public requiredStreamsErrored$: Observable<boolean>;

  private unsubscribe$ = new Subject<void>();

  availableGridPresets = new BehaviorSubject([]);
  availableWidgetPresets = new BehaviorSubject([]);
  pmsSelectedGridPresetConfig;
  pmsSelectedWidgetPresetConfig;

  pmsUserElementsOrder: PmsUserListOrder[] = [
    { position: 0, value: 'table' },
    { position: 1, value: 'summary' },
    { position: 2, value: 'statistic' }
  ];
  selectedFilters: any[];

  constructor(
    private readonly _positionHomeService: PositionHomeService,
    private readonly _spinner: PinnaklSpinner,
    private readonly _toastr: Toastr,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _positionsBackendStateFacade: PositionsBackendStateFacade,
    private readonly _positionsUiStateFacade: PositionsUiStateFacade,
    private readonly _tradeWorkflowSpecsBackendStateFacade: TradeWorkflowSpecsBackendStateFacade,
    private readonly _brokerService: BrokerService,
    private readonly _rebalanceService: RebalanceService,
    private readonly _securityService: SecurityService,
    private readonly _positionsPnlValuesSavingService: PositionsPnlValuesSavingService,
    private readonly _pageSubscriptionsHandler: PageSubscriptionsHandler,
    private cdr: ChangeDetectorRef
  ) {
    this._activatedRoute.data.subscribe(data => {
      if (data.requiredEstablishedStreamsCount || data.requiredEstablishedStreamsCount === 0) {
        const { established, errored } = this._pageSubscriptionsHandler
          .startStreamsEstablishingHandling(data.requiredEstablishedStreamsCount);
        this.requiredEstablishedStreamsReady$ = established;
        this.requiredStreamsErrored$ = errored;
      }
    });
  }

  get getSortedDraggedElements(): any[] {
    return sortBy(this.pmsUserElementsOrder, 'position');
  }

  applyPositionPreset(selectedValue: {
    selectedGridPresetId: string,
    selectedWidgetPresetId: string,
    presetName: string
  }): void {
    this._spinner.spin();
    this.configVisible = false;

    if (selectedValue) {
      this.presetName = selectedValue.presetName;
      if (selectedValue.selectedGridPresetId) {
        this.pmsSelectedGridPresetConfig = this.availableGridPresets.value.find(preset => preset.id === selectedValue.selectedGridPresetId);
        this._positionHomeService.pmsSelectedGridPresetConfig$.next(this.pmsSelectedGridPresetConfig);
        this._positionHomeService.saveCreatedPresetAsSelected(
          this.pmsSelectedGridPresetConfig,
          PresetType.SELECTED_PMS_GRID_CONFIG_ID
        ).subscribe(() => {
          this.setDataFromSelectedGridPreset();
          this._toastr.success(`Preset ${this.pmsSelectedGridPresetConfig.name} applied`);
          // Stop spinner with delay as toastr is showing with delay and we need to remove the pause
          // between stopped spinner and toastr
          setTimeout(() => {
            this._spinner.stop();
          }, 500);
        });
      }

      if (selectedValue.selectedWidgetPresetId) {
        this.pmsSelectedWidgetPresetConfig = this.availableWidgetPresets.value.find(
          preset => preset.id === selectedValue.selectedWidgetPresetId
        );
        this._positionHomeService.saveCreatedPresetAsSelected(
          this.pmsSelectedWidgetPresetConfig,
          PresetType.SELECTED_PMS_WIDGET_CONFIG_ID
        );
      }
    }
  }

  ngOnInit(): void {
    this._loadAsyncData();
    // Data has already been loaded. Facade is selecting the state from the loaded tree
    this._positionsUiStateFacade.positionsFilterString$.subscribe(res => {
      this.filterString = res;
      this.cdr.detectChanges();
    });
    this.positionsHomeSummary$ = this._positionsUiStateFacade.positionsHomeSummary$;
    this._startRealtimePortfolio();

    this.accounts$ = this._positionsUiStateFacade.accounts$;
    this.cashBalance$ = this._positionsUiStateFacade.cashBalance$;
    this.marketValueSummary$ = this._positionsUiStateFacade.marketValueSummary$.pipe(map(marketValueMapper));
    // TODO: POSITION PNL CHART
    this.mainAccount$ = this.accounts$.pipe(map(acc => acc.filter(a => a.isPrimaryForReturns)[0]));
    this.positionsPnlValues$ = this._positionsUiStateFacade.positionsPnlValues$;

    this.presetsSavingInitialization(this._activatedRoute?.snapshot?.data?.resolvedData);

    this._positionsUiStateFacade.startWebWorkerCalc();
    this._positionsBackendStateFacade.startWebWorkerCalc();

    this._positionsUiStateFacade.positionsFilterColumns$.subscribe((res) => {
      this.selectedFilters = res.map((el) => ({ name: el.name, filters: el.filters }));
    });
    this.positionsGridHeight = this.getPositionsGridHeight(this.pmsUserElementsOrder[0].value === 'summary' ? 140 : 0);
  }

  ngOnDestroy(): void {
    this._stopRealtimePortfolio();
    this._positionsPnlValuesSavingService.stopSaving();
    this._positionsBackendStateFacade.markIsLoadedAsFalse();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  actionBtnClicked(selectedRow: any): void {
    this.selectedGridRow = { ...selectedRow };
    this.selectedGridRow.securityId = selectedRow.SecurityId;
    this._openPositionPopup(this.openPositionSummaryModal);
    this.showPePositionPopup = true;
  }

  positionEditModalClosed(): void {
    this._closePositionPopup();
  }

  togglePanel(type: PanelType): void {
    Object.values(PanelType)
      .filter(i => i !== type)
      .forEach(t => (this[t] = false));
    this[type] = !this[type];
  }

  resetRebalanceConfirmationTrigger(): void {
    this._positionHomeService.positionsSelectedOrdersTrigger$.next(true);
    if (!this._positionHomeService.selectedPositionOrders$.getValue()?.length) {
      this._toastr.info('Your rebalance worksheet is empty');
      return;
    }
    this.showResetRebalanceConfirmation = true;
  }

  resetPositionsOrders(): void {
    this._positionHomeService.positionsResetOrdersTrigger$.next(true);
    this.showResetRebalanceConfirmation = false;
  }

  openRebalanceOrdersModal(): void {
    this._positionHomeService.positionsSelectedOrdersTrigger$.next(true);
    if (!this._positionHomeService.selectedPositionOrders$.getValue()?.length) {
      this._toastr.info('Create orders in rebalance worksheet for staging');
      return;
    }
    this.toggleRebalanceOrdersModal();
  }

  toggleRebalanceOrdersModal(): void {
    this.hideRebalanceOrdersModal = !this.hideRebalanceOrdersModal;
  }

  toggleRebalancePanel(): void {
    if (this.rebalanceVisible) {
      this.rebalanceVisible = false;
      this._positionsUiStateFacade.calculateRebalance = false;
    } else {
      this._positionsUiStateFacade.positionsReportSelectedColumns$.pipe(first()).subscribe(columns => {
        if (columns.find(col => col.name === 'AccountCode')) {
          this.rebalanceVisible = true;
          this._positionsUiStateFacade.calculateRebalance = true;
        } else {
          this._toastr.info('Select AccountCode as a field to use Rebalancing worksheet feature');
        }
      });
    }
  }

  togglePortfolioMenuModal(): void {
    this._openPositionPopup(this.openPortfolioModal);
  }

  togglePositionEditModal(): void {
    this._openPositionPopup(this.openPositionEditModal);
  }

  drop(event: any): void {
    moveItemInArray(this.pmsUserElementsOrder, event.previousIndex, event.currentIndex);

    this.pmsUserElementsOrder = this.pmsUserElementsOrder.map((el: PmsUserListOrder, index) => {
      el.position = index;
      return el;
    });
    this.positionsGridHeight = this.getPositionsGridHeight(this.pmsUserElementsOrder[0].value === 'summary' ? 140 : 0);
  }

  saveAsModalClose(): void {
    this.saveAsModalShow = false;
  }

  saveToNew(): void {
    this.saveAsModalShow = false;
    this.savePresetModalShow = true;
  }

  saveToCurrent(): void {
    this._spinner.spin();
    this._positionsUiStateFacade.positionsReportSelectedColumns$.pipe(first(),
      concatMap(selectedColumns => {
        const dataToSend = {
          columnsConfig: {
            userReportColumns: selectedColumns.filter(c => c.reportingColumnType === 'report'),
            userReportCustomAttributes: selectedColumns.filter(c => c.reportingColumnType === 'ca'),
            userReportIdcColumns: selectedColumns.filter(c => c.reportingColumnType === 'idc'),
            selectedFilters: this.selectedFilters
          },
          name: this.pmsSelectedGridPresetConfig.name
        };

        return this._positionHomeService.updatePreset({
          ...this._positionHomeService.generatePresetConfig(dataToSend, PresetType.PMS_GRID_CONFIG),
          id: this.pmsSelectedGridPresetConfig.id
        }, PresetType.PMS_GRID_CONFIG);
      }),
      concatMap(([updatedPreset]) => {
        this.availableGridPresets.next(this.availableGridPresets.value.map(preset => {
          if (preset.id === updatedPreset.id) {
            return updatedPreset;
          }
          return preset;
        }));
        return this.saveOrderConfig();
      })
    ).subscribe(() => {
      this._spinner.stop();
      this.saveAsModalShow = false;
    });
  }

  closeSavePresetModal(): void {
    this.savePresetModalShow = false;
  }

  savePreset(data: SavePresetFormData): void {
    this._spinner.spin();
    this.saveOrderConfig();

    const dataToSend: any = { name: data.presetName };

    if (data.presetType === PMSConfigType.GRID) {
      this._positionsUiStateFacade.positionsReportSelectedColumns$.pipe(first(),
        concatMap(selectedColumns => {
          // 2. generate preset config and save it
          dataToSend.columnsConfig = {
            userReportColumns: selectedColumns.filter(c => c.reportingColumnType === 'report'),
            userReportCustomAttributes: selectedColumns.filter(c => c.reportingColumnType === 'ca'),
            userReportIdcColumns: selectedColumns.filter(c => c.reportingColumnType === 'idc'),
            selectedFilters: this.selectedFilters
          };

          return this._positionHomeService.createGridOrWidgetConfig(
            dataToSend,
            PresetType.PMS_GRID_CONFIG
          );
        })
      ).subscribe(() => {
        this.reinitializePresets();
        this.savePresetModalShow = false;
      });
    } else {
      this._positionHomeService.createGridOrWidgetConfig(
        dataToSend,
        PresetType.PMS_WIDGET_CONFIG
      ).subscribe(() => {
        this.reinitializePresets();
        this.savePresetModalShow = false;
      });
    }
  }

  reinitializePresets(): void {
    this._positionHomeService.getSavedPMSPreset()
      .pipe(map(data => this.presetsSavingInitialization(data)))
      .subscribe(() => this._spinner.stop());
  }

  onFilterApply(): void {
    this.filterVisible = false;
  }

  private _closePositionPopup(): void {
    this.showPositionPopup = false;
    this.showPePositionPopup = false;
  }

  private _openPositionPopup(modalToOpen: Subject<void>): void {
    this.showPositionPopup = true;
    setTimeout(() => modalToOpen.next());
  }

  private _startRealtimePortfolio(): void {
    let realtimePortfolioOn = false;
    this._tradeWorkflowSpecsBackendStateFacade.realtimePortfolioOn$
      .pipe(first())
      .subscribe(on => (realtimePortfolioOn = on));
    if (realtimePortfolioOn) {
      this._positionsUiStateFacade.subscribeToRealTimePositions();
      this._positionsUiStateFacade.subscribeToRealTimePrices();
      this.subscribedToRealtimePortfolio = true;
    }
  }

  private _stopRealtimePortfolio(): void {
    if (this.subscribedToRealtimePortfolio) {
      this._positionsUiStateFacade.unSubscribeToRealTimePositions();
      this._positionsUiStateFacade.unSubscribeToRealTimePrice();
    }
  }

  private _loadAsyncData(): void {
    this._spinner.spin();
    Promise.all([
      this._brokerService.getBrokers(),
      this._rebalanceService.getFundsDetails(),
      this._securityService.getAllSecurities()
    ]).then(([brokers, fundDetails, securities]) => {
      this.brokers = brokers;
      this.funds = fundDetails;
      this.securities = securities;
      this._positionHomeService.brokers$.next(this.brokers);
      this._positionHomeService.securities$.next(this.securities);
      this._spinner.stop();
    });
  }

  private setDataFromSelectedGridPreset(): void {
    if (this.pmsSelectedGridPresetConfig) {
      this._positionsBackendStateFacade.allColumns$.subscribe(([
        columns, customAttributes, idc
      ]) => {
        const {
          userReportColumns,
          userReportCustomAttributes,
          userReportIdcColumns
        } = JSON.parse(JSON.stringify(this.pmsSelectedGridPresetConfig.columnsConfig));

        // Update saved caption for columns
        userReportColumns?.forEach(c => {
          const col = columns.find(_c => _c.name === c.name);
          if (col) {
            c.caption = col.caption;
          }
        });

        this._positionsUiStateFacade.saveUserReportColumns(userReportColumns);
        this._positionsUiStateFacade.saveUserReportCustomAttributes(userReportCustomAttributes);
        this._positionsUiStateFacade.saveUserReportIdcColumn(userReportIdcColumns);
      });
    }
  }

  private saveOrderConfig(): Observable<PmsUserListOrder[]> {
    return this._positionHomeService.saveOrderConfig(this.pmsUserElementsOrder);
  }

  private presetsSavingInitialization(data: PMSConfig): void {
    if (data) {
      if (data.order) {
        this.pmsUserElementsOrder = data.order;
      }
      if (data.widget) {
        this.availableWidgetPresets.next(data.widget);

        const selectedWidgetId = this._positionHomeService.selectedPmsWidgetConfig?.selectedId;
        const itemToSelect = this.availableWidgetPresets.value.find(preset => preset.id === selectedWidgetId);
        if (itemToSelect) {
          this.pmsSelectedWidgetPresetConfig = itemToSelect;
        } else {
          this.pmsSelectedWidgetPresetConfig = this.availableWidgetPresets.value[0];
          this._positionHomeService.saveCreatedPresetAsSelected(
            this.availableWidgetPresets.value[0],
            PresetType.SELECTED_PMS_WIDGET_CONFIG_ID
          );
        }
      } else {
        this.availableWidgetPresets.next([]);
        this.pmsSelectedWidgetPresetConfig = undefined;
      }
      if (data.grid) {
        this.availableGridPresets.next(data.grid);

        const selectedGridId = this._positionHomeService.selectedPmsGridConfig?.selectedId;
        const itemToSelect = this.availableGridPresets.value.find(preset => preset.id === selectedGridId);
        this.presetName = itemToSelect.name;
        if (itemToSelect) {
          this.pmsSelectedGridPresetConfig = itemToSelect;
        } else {
          this.pmsSelectedGridPresetConfig = this.availableGridPresets.value[0];
          this._positionHomeService.saveCreatedPresetAsSelected(
            this.availableGridPresets.value[0],
            PresetType.SELECTED_PMS_GRID_CONFIG_ID
          );
        }
        this.setDataFromSelectedGridPreset();
      } else {
        this.availableGridPresets.next([]);
        this.pmsSelectedGridPresetConfig = undefined;
      }
      this._positionHomeService.pmsSelectedGridPresetConfig$.next(this.pmsSelectedGridPresetConfig);
    } else {
      this.availableGridPresets.next([]);
      this.availableWidgetPresets.next([]);
      this.pmsSelectedGridPresetConfig = undefined;
      this.pmsSelectedWidgetPresetConfig = undefined;
    }
  }
  getPositionsGridHeight(pGridPos = 0) {
    const newHeight = window.innerHeight - 220 - pGridPos;
    return {
      value: this.positionsGridHeight.value > newHeight ? newHeight : this.positionsGridHeight.value,
      sizing: 'px'
    };
  }
}

function marketValueMapper(data: MarketValueSummary): MarketValueSummaryElement[] {
  return [{
    name: 'LMV',
    today: data.lmvT || 0,
    yesterday: data.lmvY || 0
  }, {
    name: 'SMV',
    today: data.smvT || 0,
    yesterday: data.smvY || 0
  }, {
    //   name: 'P&L',
    //   today: data.pnlT || 0,
    //   yesterday: data.pnlY || 0
    // }, {
    name: 'Cash',
    today: data.cashT || 0,
    yesterday: data.cashY || 0
  }];
}
