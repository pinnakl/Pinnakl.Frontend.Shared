import { DatePipe, DecimalPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { createSelector, MemoizedSelector, select, Store } from '@ngrx/store';
import { UserService } from '@pnkl-frontend/core';
import {
  Account,
  AgPeekTextComponent,
  CellRendererNumericValueChange,
  CellRendererPositiveNegative,
  ClientReportColumn,
  CurrencyForOMS,
  IdcColumn,
  PinnaklColDef,
  PositionsPnlValueModel,
  ReportingColumn,
  ReportParameter,
  SecurityPriceAlert,
  selectAllAccounts,
  selectAllCurrencies,
  UserReportColumn,
  UserReportCustomAttribute,
  UserReportIdcColumn,
  WatchlistItem
} from '@pnkl-frontend/shared';
import { ICellRendererParams, ValueFormatterParams } from 'ag-grid-community';
import { isEmpty, sortBy, sumBy } from 'lodash';
import { BehaviorSubject, interval, Observable } from 'rxjs';
import { filter, first, map, take } from 'rxjs/operators';
import { selectAllIdcColumns, selectAllPositionsReportColumns, selectAllPositionsReportData, selectPositionsPnlValues } from '../positions-backend-state';
import { LoadUserReportColumns } from '../positions-backend-state/store/user-report-column/user-report-column.actions';
import { LoadUserReportCustomAttributes } from '../positions-backend-state/store/user-report-custom-attribute-column/user-report-custom-attribute.actions';
import { LoadUserReportIdcColumns } from '../positions-backend-state/store/user-report-idc-column/user-report-idc-column.actions';
import { CashBalanceUI } from '../positions-ui/positions-home-cash-balance/positions-home-cash-balance.component';
import { MarketValueSummary } from '../positions-ui/positions-home-market-value-summary/MarketValueSummary.interface';
import { PositionHomeService } from './../positions-ui/position-home/position-home.service';
import {
  cashBalance,
  marketValueSummary,
  positionsFilterString,
  positionsHomeSummary,
  selectAlertsData,
  selectAllPositionReportSaveSelectedColumns,
  selectAllPositionReportSelectedColumns,
  selectAllPositionsConfigAvailableReportColumns,
  selectAllPositionsConfigSelectedIdcColumns,
  selectAllPositionsConfigSelectedReportColumns,
  selectAllPositionsData,
  selectAllPositionsFilterColumns,
  selectAllPositionsFilterParameterValues,
  selectDataForRowNode,
  selectPositionsCalculatedData,
  selectPositionsColumnsFilteredValues,
  selectWatchlistData,
  State
} from './store';
import { UpdatePositionsCalculatedData } from './store/positions-calculated-data';
import { ApplyPositionsFilter } from './store/positions-filter/positions-filter.actions';
import { UpdateGroupOrders, UpdateSortOrders, UpdateViewOrders } from './store/positions-grid/positions-grid.actions';
import { SetSelectedAccountsWithoutAum } from './store/positions-home-summary-selected-account/positions-home-summary-selected-account.actions';
import { PositionsHomeSummary } from './store/positions-home-summary-selected-account/positions-home-summary.model';
import { UpdatePositionsReportParameterValues } from './store/positions-report-parameter-value/positions-report-parameter-value.actions';
import { AttemptSavePositionsReport } from './store/positions-report-save-manager/positions-report-save-manager.actions';
import {
  DeletePositionsReportSaveSelectedColumns, LoadPositionsReportSaveSelectedColumns
} from './store/positions-report-save-selected-column/positions-report-save-selected-column.actions';
import {
  AddPositionsReportSelectedColumns,
  DeletePositionsReportSelectedColumns,
  LoadPositionsReportSelectedColumns,
  SelectDefaultPositionsReportSelectedColumns,
  UpdatePositionsReportSelectedColumns
} from './store/positions-report-selected-column/positions-report-selected-column.actions';
import { SubscribeToRealTimePortfolioStatus, UnSubscribeToRealTimePortfolioStatus } from './store/real-time-portfolio-status/real-time-portfolio-status.actions';
import { SubscribeToRealTimeGreeks, SubscribeToRealTimePrice, UnSubscribeToRealTimePrice } from './store/real-time-price/real-time-price.actions';
import { AttemptLoadSelectedCurrency } from './store/selected-currency/selected-currency.actions';


@Injectable()
export class PositionsUiStateFacade {
  calculateRebalance = false;

  constructor(
    private readonly _datePipe: DatePipe,
    private readonly _decimalPipe: DecimalPipe,
    private readonly _store: Store<State>,
    private readonly _userService: UserService,
    private readonly positionHomeService: PositionHomeService
  ) { }

  getPositionsCalculatedData$: Observable<any[]> = this._selectFromStore(
    selectPositionsCalculatedData
  );

  getRowNodeId$: Observable<(data: any) => string> = this._selectFromStore(
    selectDataForRowNode
  );

  positionsConfigAllIdcColumns$: Observable<
    IdcColumn[]
  > = this._selectFromStore(selectAllIdcColumns);

  positionsConfigAvailableReportColumns$: Observable<
    ReportingColumn[]
  > = this._selectFromStore(selectAllPositionsConfigAvailableReportColumns);

  positionsConfigSelectedIdcColumns$: Observable<
    ReportingColumn[]
  > = this._selectFromStore(selectAllPositionsConfigSelectedIdcColumns);

  positionsConfigSelectedReportColumns$: Observable<
    ReportingColumn[]
  > = this._selectFromStore(selectAllPositionsConfigSelectedReportColumns);

  positionsFilterColumns$: Observable<
    (ReportingColumn & { dropdownOptions: string[] })[]
  > = this._selectFromStore(selectAllPositionsFilterColumns);

  positionsFilterParameterValues$: Observable<
    ReportParameter[]
  > = this._selectFromStore(selectAllPositionsFilterParameterValues);

  positionsFilterString$: Observable<string> = this._selectFromStore(
    positionsFilterString
  );

  marketValueSummary$: Observable<MarketValueSummary> = this._selectFromStore(
    marketValueSummary
  );

  positionsHomeSummary$: Observable<PositionsHomeSummary> = this._selectFromStore(
    positionsHomeSummary
  );

  positionsPnlValues$: Observable<
    PositionsPnlValueModel[]
  > = this._selectFromStore(selectPositionsPnlValues);

  positionsGridAggregations$: Observable<any[]> = this._selectFromStore(
    createSelector(
      selectAllPositionReportSelectedColumns,
      selectPositionsColumnsFilteredValues,
      selectPositionsCalculatedData,
      (columns, filteredValues, rows) => {
        if (!columns) {
          return [];
        }

        // To add sum of trade cost column (from rebalancing)
        columns = columns.concat([
          {
            decimalPlaces: 2,
            isAggregating: true,
            name: 'tradeCost'
          } as ReportingColumn
        ]);

        // Filter data by showed data in grid
        if (!isEmpty(filteredValues.entities)) {
          rows = rows.filter(r => {
            const accounts = filteredValues.entities[r.SecurityId];
            if (!accounts) {
              return false;
            }
            if (!accounts.length) {
              return true;
            }
            return accounts.includes(r.AccountId);
          });
        }
        const reportAggregation = columns.reduce(
          (aggregation, { decimalPlaces, isAggregating, name }) => {
            aggregation[name] = '';
            if (isAggregating && name !== 'Mark') {
              const sumCol = sumBy(rows, name),
                digitInfo =
                  decimalPlaces === undefined || decimalPlaces === null
                    ? null
                    : `1.${decimalPlaces}-${decimalPlaces}`;
              aggregation[name] = this._decimalPipe.transform(
                sumCol,
                digitInfo
              );
            }
            return aggregation;
          },
          {}
        );

        for (const key of Object.keys(reportAggregation)) {
          if (reportAggregation[key] === null) {
            reportAggregation[key] = '';
          }
        }

        return [reportAggregation];
      }
    )
  );

  positionsGridColDefs$: Observable<PinnaklColDef[]> = this._selectFromStore(
    createSelector(selectAllPositionReportSaveSelectedColumns, columns =>
      sortBy(columns, ['viewOrder']).map(
        ({
          caption,
          decimalPlaces,
          groupOrder,
          include,
          isAggregating,
          name,
          renderingFunction,
          reportingColumnType,
          sortAscending,
          sortOrder,
          type
        }) => {
          const colDef: PinnaklColDef & { suppressToolPanel?: boolean } = {
            enableRowGroup: true,
            field: reportingColumnType === 'idc' ? caption : name,
            filter: true,
            headerName: caption,
            sortable: true,
            suppressToolPanel: true,
            suppressSizeToFit: false,
            resizable: true,
            flex: 1
          };
          if (!include) {
            colDef.hide = true;
          }
          if (!(groupOrder === null || groupOrder === undefined)) {
            colDef.hide = true;
            colDef.rowGroupIndex = groupOrder;
          }
          if (!(sortOrder === null || sortOrder === undefined)) {
            colDef.sort = sortAscending ? 'asc' : 'desc';
            colDef.sortedAt = sortOrder;
          }
          if (name === 'Description' || name === 'Sector') {
            colDef.flex = 3;
          }
          if (isAggregating && name !== 'Mark') {
            colDef.aggFunc = 'sum';
            colDef.pinnedRowCellRenderer = ({ value }: ICellRendererParams) =>
              `<b>${value}</b>`;
          }

          if (['Mark', 'Cost', 'ChangePercent', 'prcChg'].includes(name)) {
            colDef.aggFunc = params => {
              if (params.values.every(el => el === params.values[0])) {
                return params.values[0];
              }
            };
          }

          switch (type) {
            case 'text':
              colDef.aggFunc = params => {
                if (params.values.every(el => el === params.values[0])) {
                  return params.values[0];
                }
              };
              break;
            case 'boolean':
              colDef.cellRenderer = ({ value }: ICellRendererParams) => {
                if (!value || value.toLowerCase() === 'false') {
                  return '';
                } else {
                  return '<i class="icon-pinnakl-ok color-green"></i>';
                }
              };
              break;
            case 'currency':
            case 'numeric':
            case 'stream':
            case 'calculation':
              this._numericFormatter(
                colDef,
                decimalPlaces,
                type,
                isAggregating || name === 'Mark'
              );
              break;
            case 'custom':
              try {
                const fn = Function('params', renderingFunction);
                colDef.cellRenderer = <any>fn;
              } catch (e) {
                console.error(e);
              }
              break;
            case 'date':
              colDef.filter = 'date';
              colDef.valueFormatter = ({ value }: ValueFormatterParams) => {
                try {
                  return this._datePipe.transform(value, 'MM/dd/y');
                } catch (e) {
                  return value;
                }
              };
              break;
            case 'longText':
              colDef.autoHeight = true;
              colDef.cellRendererFramework = AgPeekTextComponent;
              colDef.cellStyle = {
                'white-space': 'pre-line',
                'word-wrap': 'break-word'
              };
              colDef.customType = 'LongText';
              colDef.flex = 3;
              break;
          }
          return colDef;
        }
      )
    )
  );

  mappedAlertsData$: Observable<SecurityPriceAlert[]> = this._selectFromStore(
    selectAlertsData
  );

  mappedWatchlistData$: Observable<WatchlistItem[]> = this._selectFromStore(
    selectWatchlistData
  );

  positionsReportSelectedColumns$: Observable<
    ReportingColumn[]
  > = this._selectFromStore(selectAllPositionReportSelectedColumns);

  accounts$: Observable<Account[]> = this._selectFromStore(selectAllAccounts);

  cashBalance$: Observable<CashBalanceUI[]> = this._selectFromStore(
    cashBalance
  );

  attemptSavePositionsReport(payload: {
    clientReportColumns: ClientReportColumn[];
    selectedColumns: ReportingColumn[];
    userReportColumns: UserReportColumn[];
    userReportIdcColumns: UserReportIdcColumn[];
    userReportCustomAttributes: UserReportCustomAttribute[];
  }): void {
    const reportId = this._getReportId();
    this._store.dispatch(
      AttemptSavePositionsReport({ ...payload, reportId })
    );
  }

  applyPositionsFilter(idcColumnsAdded: ReportingColumn[]): void {
    this._store.dispatch(ApplyPositionsFilter({ idcColumnsAdded }));
  }

  selectColumns(positionsReportSelectedColumns: ReportingColumn[]): void {
    this._store.dispatch(
      AddPositionsReportSelectedColumns({ positionsReportSelectedColumns })
    );
  }

  saveSelectedColumns(positionsReportSelectedColumns: ReportingColumn[]): void {
    this._store.dispatch(
      LoadPositionsReportSelectedColumns({ positionsReportSelectedColumns })
    );
    this._store.dispatch(
      LoadPositionsReportSaveSelectedColumns({
        positionsReportSelectedColumns
      })
    );
  }

  saveUserReportColumns(userReportColumns: UserReportColumn[]): void {
    this._store.dispatch(LoadUserReportColumns({ userReportColumns }));
  }

  saveUserReportCustomAttributes(
    userReportCustomAttributes: UserReportCustomAttribute[]
  ): void {
    this._store.dispatch(
      LoadUserReportCustomAttributes({ userReportCustomAttributes })
    );
  }

  saveUserReportIdcColumn(userReportIdcColumns: UserReportIdcColumn[]): void {
    this._store.dispatch(
      LoadUserReportIdcColumns({ userReportIdcColumns })
    );
  }

  loadSelectedCurrency(currency: CurrencyForOMS, date: Date): void {
    this._store.dispatch(AttemptLoadSelectedCurrency({ date, currency }));
  }

  selectAllCurrencies(): Observable<CurrencyForOMS[]> {
    return this._store.pipe(select(selectAllCurrencies));
  }

  selectDefaultPositionsReportSelectedColumns(): void {
    this._store.dispatch(SelectDefaultPositionsReportSelectedColumns());
  }

  subscribeToRealTimePositions(): void {
    if (this._userService.getUser().id !== 20) {
      this._store.dispatch(SubscribeToRealTimePortfolioStatus());
    }
  }

  subscribeToRealTimePrices(): void {
    if (this._userService.getUser().id !== 20) {
      this._store.dispatch(SubscribeToRealTimePrice());
      this._store.dispatch(SubscribeToRealTimeGreeks());
    }
  }

  unselectColumns(
    positionsReportSelectedColumns: {
      name: string;
      reportingColumnType: string;
    }[]
  ): void {
    this._store.dispatch(DeletePositionsReportSelectedColumns({ payload: { positionsReportSelectedColumns } }));
    this._store.dispatch(
      DeletePositionsReportSaveSelectedColumns({ payload: { positionsReportSelectedColumns } })
    );
  }

  unSubscribeToRealTimePositions(): void {
    this._store.dispatch(UnSubscribeToRealTimePortfolioStatus());
  }

  unSubscribeToRealTimePrice(): void {
    this._store.dispatch(UnSubscribeToRealTimePrice());
  }

  updatePositionsFilterParameterValues(params: ReportParameter[]): void {
    this._store.dispatch(
      UpdatePositionsReportParameterValues({
        positionsReportParameterValues: params.map(param => ({
          id: param.id,
          changes: param
        }))
      })
    );
  }

  updatePositionsReportSelectedColumns(
    columns: Partial<ReportingColumn>[]
  ): void {
    this._store.dispatch(
      UpdatePositionsReportSelectedColumns({
        positionsReportSelectedColumns: columns
      })
    );

    // if there is account column in filters then we should fetch aum for filtered values from column
    const accountCodeColumn = columns.find(c => c.name === 'AccountCode');
    if (accountCodeColumn) {
      if (
        Array.isArray(accountCodeColumn?.filters) &&
        accountCodeColumn.filters.length
      ) {
        const filters: any[] = Array.isArray(accountCodeColumn.filters)
          ? accountCodeColumn.filters
          : [accountCodeColumn.filters];
        this._store
          .pipe(select(selectAllPositionsReportData), take(1))
          .subscribe(data => {
            const idsSet = new Set();
            data.forEach(d => {
              if (filters.includes(d[accountCodeColumn.name])) {
                idsSet.add(d.AccountId);
              }
            });
            this._store.dispatch(
              SetSelectedAccountsWithoutAum({ payload: Array.from(idsSet).map((id): any => ({ id })) })
            );
          });
      } else {
        this.accounts$.subscribe(accounts => {
          this._store.dispatch(
            SetSelectedAccountsWithoutAum({ payload: Array.from(accounts) })
          );
        });
      }
    }
  }

  updateGroupOrders(
    groupOrders: { groupOrder: number; name: string }[],
    selectedColumns: ReportingColumn[]
  ): void {
    this._store.dispatch(
      UpdateGroupOrders({ groupOrders, selectedColumns })
    );
  }

  updateSortOrders(
    selectedColumns: ReportingColumn[],
    sortOrders: { name: string; sortAscending: boolean; sortOrder: number }[]
  ): void {
    this._store.dispatch(UpdateSortOrders({ selectedColumns, sortOrders }));
  }

  updateViewOrders(
    selectedColumns: ReportingColumn[],
    viewOrders: { name: string; viewOrder: number }[]
  ): void {
    this._store.dispatch(UpdateViewOrders({ selectedColumns, viewOrders }));
  }

  startWebWorkerCalc(): void {
    const data$ = new BehaviorSubject(null);
    this._selectFromStore(selectAllPositionsData).subscribe(data$);

    const gridDataCalculator = new Worker(new URL('./worker/positions-data.worker', import.meta.url), {
      type: 'module',
      name: 'positions-data-grid-calculator'
    });

    const rebalanceConfig = this.positionHomeService.pmsRebalanceConfig$.getValue();

    gridDataCalculator.onmessage = message =>
      this._store.dispatch(
        UpdatePositionsCalculatedData({ data: message.data })
      );

    interval(1000)
      .pipe(
        map(() => data$.value),
        filter(data => !!data)
      )
      .subscribe(allData =>
        gridDataCalculator.postMessage({
          ...allData,
          calculateRebalance: this.calculateRebalance,
          rebalanceConfig
        })
      );
  }

  private _getReportId(): number {
    let reportId: number;
    this._store
      .pipe(select(selectAllPositionsReportColumns), first())
      .subscribe(reportColumns => (reportId = reportColumns[0].reportId));
    return reportId;
  }

  private _numericFormatter(
    cd: PinnaklColDef,
    decimalPlaces: number,
    type: string,
    isAggregating: boolean
  ): void {
    if (
      ['pnlrealized', 'pnlunrealized', 'pnltotal', 'pnltotalpct', 'prcchg', 'changepercent'].includes(
        cd.field.toLowerCase()
      )
    ) {
      cd.cellRenderer = CellRendererPositiveNegative;
    } else if (isAggregating &&
      !['MVUSD', 'LMVUSD', 'SMVUSD', 'MVUSDPct', 'DeltaAdjExposure', 'DeltaAdjPosition', 'DeltaAdjMVPct', 'Position'].find(el =>
        el.toLowerCase() === cd.field.toLowerCase()
      ) && !cd.field.includes('MV')) {
      cd.cellRenderer = CellRendererNumericValueChange;
    }
    cd.cellStyle = { 'text-align': 'right' };
    cd.filter = 'agNumberColumnFilter';
    const prefix = type === 'currency' ? '$' : '';
    cd.valueFormatter = ({ value }: ValueFormatterParams) => {
      if (!value && value !== 0) {
        return '';
      }
      const digitInfo =
        decimalPlaces === undefined || decimalPlaces === null
          ? null
          : `1.${decimalPlaces}-${decimalPlaces}`;
      try {
        let valueToShow =
          prefix + this._decimalPipe.transform(value, digitInfo);
        if (!isFinite(value)) {
          valueToShow = '';
          // Add % at the end
        } else if (
          cd.field.toLowerCase() === 'impliedvol' ||
          cd.headerName.includes('%')
        ) {
          valueToShow += ' %';
        }

        return valueToShow;
      } catch (e) {
        return prefix + value;
      }
    };
  }

  private _selectFromStore<T>(
    selector: MemoizedSelector<any, T>
  ): Observable<T> {
    return this._store.pipe(select(selector));
  }
}
