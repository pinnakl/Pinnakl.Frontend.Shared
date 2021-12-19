import { ActionReducerMap, createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import {
  CashBalance,
  SecurityPriceAlert,
  selectAccountsAumState,
  selectAllAccounts,
  selectAllCashBalance,
  WatchlistItem
} from '@pnkl-frontend/shared';
import { chain } from 'lodash';
import {
  selectAllPositionsReportColumns,
  selectAllPositionsReportData,
  selectAllPositionsReportParameters,
  selectAllSecurityCustomAttributes,
  selectAllSecurityPricesAlerts,
  selectAllWatchlistItems,
  selectCashData
} from '../../positions-backend-state';
import { selectPositionsCalculatedAllData } from '../../positions-backend-state/store';
import {
  initialMarketValueSummaryObject,
  _getReportingColumnFromReportColumn,
  _getReportingColumnFromSecurityCustomAttribute,
  _sortByCaption,
  _sortByName
} from '../../positions-helpers';

import * as fromPositionsCalculatedData from './positions-calculated-data/positions-calculated-data.reducer';
import * as fromPositionsColumnsFilteredValues from './positions-columns-filtered-values/positions-columns-filtered-values.reducer';
import * as fromPositionsHomeSelectedAccount from './positions-home-summary-selected-account/positions-home-summary-selected-account.reducer';
import * as fromPositionsReportParameterValue from './positions-report-parameter-value/positions-report-parameter-value.reducer';
import * as fromPositionsReportSaveSelectedColumn from './positions-report-save-selected-column/positions-report-save-selected-column.reducer';
import * as fromPositionsReportSelectedColumn from './positions-report-selected-column/positions-report-selected-column.reducer';
import * as fromSelectedCurrency from './selected-currency/selected-currency.reducer';

export interface State {
  positionsColumnsFilteredValues: fromPositionsColumnsFilteredValues.State;
  positionsHomeSelectedAccounts: fromPositionsHomeSelectedAccount.State;
  positionsReportParameterValue: fromPositionsReportParameterValue.State;
  positionsReportSelectedColumn: fromPositionsReportSelectedColumn.State;
  positionsReportSaveSelectedColumn: fromPositionsReportSaveSelectedColumn.State;
  selectedCurrency: fromSelectedCurrency.State;
  positionsCalculatedData: fromPositionsCalculatedData.State;
}

export const reducers: ActionReducerMap<State> = {
  positionsColumnsFilteredValues: fromPositionsColumnsFilteredValues.reducer,
  positionsHomeSelectedAccounts: fromPositionsHomeSelectedAccount.reducer,
  positionsReportParameterValue: fromPositionsReportParameterValue.reducer,
  positionsReportSelectedColumn: fromPositionsReportSelectedColumn.reducer,
  positionsReportSaveSelectedColumn: fromPositionsReportSaveSelectedColumn.reducer,
  selectedCurrency: fromSelectedCurrency.reducer,
  positionsCalculatedData: fromPositionsCalculatedData.reducer
};

const featureSelector = createFeatureSelector<State>('positionsUi');

// PositionsCalculatedData Selectors
export const selectPositionsCalculatedData = createSelector(
  featureSelector,
  (state: State) => JSON.parse(JSON.stringify(state.positionsCalculatedData.calculatedData))
);

// PositionReportSelectedColumn Selectors
const selectFeaturePositionsReportSelectedColumn = createSelector(
  featureSelector,
  (state: State) => state.positionsReportSelectedColumn
);
export const selectAllPositionReportSelectedColumns = createSelector(
  selectFeaturePositionsReportSelectedColumn,
  fromPositionsReportSelectedColumn.selectEntities
);

// PositionReportSaveSelectedColumn Selectors
const positionsReportSaveSelectedColumnSelector = createSelector(
  featureSelector,
  (state: State) => state.positionsReportSaveSelectedColumn
);
export const selectAllPositionReportSaveSelectedColumns = createSelector(
  positionsReportSaveSelectedColumnSelector,
  fromPositionsReportSaveSelectedColumn.selectEntities
);

// PositionsReportParameterValue Selectors
const selectFeaturePositionsReportParameterValue = createSelector(
  featureSelector,
  (state: State) => state.positionsReportParameterValue
);
export const selectAllPositionsReportParameterValues = createSelector(
  selectFeaturePositionsReportParameterValue,
  fromPositionsReportParameterValue.selectAll
);

// SelectedCurrency Selectors
const selectFeatureSelectedCurrency = createSelector(
  featureSelector,
  (state: State) => state.selectedCurrency
);
export const selectPositionsSelectedCurrency = createSelector(
  selectFeatureSelectedCurrency,
  fromSelectedCurrency.selectedCurrency
);

// PositionsHomeSelectedAccount Selectors
const selectPositionsHomeSelectedAccounts = createSelector(
  featureSelector,
  (state: State) => state.positionsHomeSelectedAccounts
);
export const selectPositionsHomeSelectedAccountIds = createSelector(
  selectPositionsHomeSelectedAccounts,
  fromPositionsHomeSelectedAccount.selectedAccountIds
);

// Columns filter
export const selectPositionsColumnsFilteredValues = createSelector(
  featureSelector,
  (state: State) => state.positionsColumnsFilteredValues
);

export const selectAllPositionsConfigAvailableReportColumns = createSelector(
  selectAllPositionsReportColumns,
  selectAllSecurityCustomAttributes,
  selectAllPositionReportSelectedColumns,
  selectAccountsAumState,
  selectAllAccounts,
  (
    reportColumns,
    customAttributes,
    selectedColumns,
    accountsAum,
    accounts
  ) => {
    const availableReportColumns = (reportColumns as any[])
      .filter(
        rc =>
          !selectedColumns.some(
            sc => sc.reportingColumnType === 'report' && sc.name === rc.name
          )
      )
      .map(_getReportingColumnFromReportColumn);
    const availableCustomAttributes = customAttributes
      .filter(
        ca =>
          !selectedColumns.some(
            sc => sc.reportingColumnType === 'ca' && sc.name === ca.name
          )
      )
      .map(_getReportingColumnFromSecurityCustomAttribute);

    const customColumns = accountsAum.map(aum => ({
      caption: `${accounts.find(acc => +acc.id === aum.accountId)?.accountCode} MV%`,
      convertToBaseCurrency: false,
      decimalPlaces: 2,
      filters: null,
      dbId: Math.round(Math.random() * 1000000),
      formula: 'custom',
      groupOrder: null,
      include: true,
      isAggregating: true,
      name: `MV${aum.accountId}`,
      renderingFunction: '',
      reportingColumnType: 'report',
      sortAscending: null,
      sortOrder: null,
      type: 'numeric',
      viewOrder: null
    })).filter(rc =>
      !selectedColumns.some(
        sc => sc.reportingColumnType === 'report' && sc.name === rc.name
      ));

    return _sortByCaption(
      availableReportColumns.concat([...availableCustomAttributes, ...(customColumns as any[])])
    );
  }
);

export const selectAllPositionsConfigSelectedIdcColumns = createSelector(
  selectAllPositionReportSelectedColumns,
  selectedColumns => _sortByCaption(
    selectedColumns.filter(sc => ['idc'].includes(sc.reportingColumnType))
  )
);

export const selectAllPositionsConfigSelectedReportColumns = createSelector(
  selectAllPositionReportSelectedColumns,
  selectedColumns => _sortByCaption(
    selectedColumns.filter(sc =>
      ['ca', 'report'].includes(sc.reportingColumnType)
    )
  )
);

export const selectAllPositionsFilterColumns = createSelector(
  selectAllPositionReportSelectedColumns,
  selectAllPositionsReportData,
  (selectedColumns, reportData) => _sortByCaption(
    selectedColumns.map(sc => {
      const dropdownOptions: string[] =
        sc.type !== 'text'
          ? []
          : chain(reportData)
            .filter(row => row[sc.name])
            .map(row => row[sc.name])
            .uniq()
            .sort()
            .value();
      return {...sc, dropdownOptions};
    })
  )
);

export const selectAllPositionsFilterParameterValues = createSelector(
  selectAllPositionsReportParameters,
  selectAllPositionsReportParameterValues,
  (parameters, parameterValues) => !parameterValues.length
    ? parameters
    : _sortByName(
      parameters.map(p => {
        const {value} = parameterValues.find(pv => pv.id === p.id);
        return {...p, value};
      })
    )
);

export const positionsFilterString = createSelector(
  selectAllPositionsFilterColumns,
  selectAllPositionsFilterParameterValues,
  (filterColumns, reportParameters) => {
    const parametersString =
        reportParameters && reportParameters.length > 0
          ? reportParameters
            .filter(param =>
              param.type === 'numeric'
                ? !isNaN(parseFloat(<string>param.value))
                : param.value
            )
            .reduce((fs, param) => {
              const type = param.type;
              let value = param.value;
              if (type && type.toLowerCase() === 'date') {
                value = (<Date>value).toLocaleDateString();
              }
              return `${fs} ${param.caption}:${value},`;
            }, '')
            .slice(0, -1)
          : '',
      columnsString =
        filterColumns && filterColumns.length > 0
          ? filterColumns
            .filter(
              col =>
                col.filters !== undefined &&
                col.filters !== null &&
                (col.filters instanceof Array ? col.filters.length > 0 : true)
            )
            .reduce((fs, col) => {
              const filters = col.filters,
                formattedValue =
                  col.filters instanceof Array
                    ? (<string[]>filters).map(value => value.toUpperCase())
                    : filters;
              return `${fs} ${col.caption}:${formattedValue},`;
            }, '')
            .slice(0, -1)
          : '';
    return parametersString
      ? columnsString
        ? `${parametersString},${columnsString}`
        : parametersString
      : columnsString;
  }
);

export const selectPositionsSelectedFxRate = createSelector(
  selectPositionsSelectedCurrency,
  currency => (currency ? currency.fxRate : null)
);

export const selectAlertsData = createSelector(
  selectAllPositionsReportData,
  selectAllSecurityPricesAlerts,
  (reportData, priceAlerts) => priceAlerts.map(alert => {
    const report = reportData.find(r => r.SecurityId === +alert.securityid);
    return report
      ? new SecurityPriceAlert({
        ...alert,
        currentPrice:
          alert.pricetype === 'Implied Vol'
            ? report.impliedVol
            : report.Mark
      })
      : alert;
  })
);

export const selectWatchlistData: MemoizedSelector<any, any[]> = createSelector(
  selectAllPositionsReportData,
  selectAllWatchlistItems,
  (reportData, watchlistItems) => watchlistItems.map(item => {
    const report = reportData.find(r => r.SecurityId === +item.securityid);
    return report
      ? new WatchlistItem({
        ...item,
        lastPrice: report.Mark,
        low: report.low,
        high: report.high,
        netchange: report.changePercent
      })
      : item;
  })
);

export const selectDataForRowNode = createSelector(
  selectAllPositionsReportColumns,
  selectAllSecurityCustomAttributes,
  (reportColumns, securityCustomAttributes) => {
    const nonAggregatingColumns = reportColumns
      .filter(
        ({isAggregating, type}) =>
          !isAggregating && !['stream', 'calculation'].includes(type)
      )
      .map(({name}) => name);
    const customAttributeNames = securityCustomAttributes.map(({name}) => name);
    const allColumns = nonAggregatingColumns.concat(customAttributeNames);
    return data => allColumns.map(c => data[c]).join('*');
  }
);

export const selectAllPositionsData = createSelector(
  selectAllPositionsReportData,
  selectAllPositionReportSelectedColumns,
  selectPositionsSelectedFxRate,
  selectAccountsAumState,
  selectAllPositionsReportColumns,
  selectPositionsColumnsFilteredValues,
  (reportData, selectedColumns, fxRate, aumState, allColumns, filters) => ({
    reportData,
    selectedColumns,
    fxRate,
    aumState,
    allColumns,
    filters
  })
);

export const cashBalance = createSelector(
  selectAllCashBalance,
  selectPositionsHomeSelectedAccountIds,
  (cashBal, ids) => {
    cashBal = cashBal.filter(cb => ids.includes(cb.accountId));
    const calculatedCashBalance = cashBal.reduce((acc, item) => {
      if (acc.find(a => a.currency === item.currency)) {
        return acc.map(a => {
          if (a.currency === item.currency) {
            return new CashBalance(
              a.id,
              a.date,
              a.accountId,
              a.custodianId,
              a.currency,
              a.amount + item.amount,
              a.amountUSD + item.amountUSD
            );
          }
          return a;
        });
      }
      return [...acc, item];
    }, []);

    return calculatedCashBalance.map(cb => ({
        title: cb.currency,
        amount: cb.amount,
        lmv: 0,
        smv: 0,
        total: 0,
        baseConvert: cb.amountUSD,
        sign: cb.currency
      }));
  }
);

export const marketValueSummary = createSelector(
  selectCashData,
  selectPositionsCalculatedAllData,
  selectPositionsHomeSelectedAccountIds,
  (cashData, data, selectedAccountIds) => {
    const cashYesterday = cashData
      .filter(cash => selectedAccountIds.includes(cash.accountId))
      .reduce(
      (acc, d) => acc + d.cashYesterday,
      0
    );
    const cashDifference = cashData
      .filter(cash => selectedAccountIds.includes(cash.accountId))
      .reduce(
      (acc, d) => acc + d.cashToday,
      0
    );
    return data
      .filter(dataItem => selectedAccountIds.includes(dataItem.AccountId))
      .reduce(
      (acc, dataItem) => ({
        lmvY: acc.lmvY + dataItem['LMVUSDLast'],
        lmvT: acc.lmvT + dataItem['LMVUSD'],
        smvY: acc.smvY + dataItem['SMVUSDLast'],
        smvT: acc.smvT + dataItem['SMVUSD'],
        pnlY: 0,
        pnlT:
          acc.pnlT +
          dataItem['pnlRealized'] +
          (isNaN(dataItem['pnlUnRealized'])
            ? 0
            : dataItem['pnlUnRealized']),
        cashY: cashYesterday,
        cashT: cashYesterday + cashDifference
      }),
      initialMarketValueSummaryObject(cashYesterday, cashDifference)
    );
  }
);

export const positionsHomeSummary = createSelector(
  selectAccountsAumState,
  selectCashData,
  selectPositionsCalculatedAllData,
  selectPositionsHomeSelectedAccountIds,
  (aumState, cashData, gridData, selectedAccountIds) => gridData
    .filter(data => selectedAccountIds.includes(data.AccountId))
    .reduce((summary, row) => {
      summary.realizedPnl += row['pnlRealized'];
      summary.totalMVUSD += row['MVUSDLast'];
      summary.unRealizedPnl += row['pnlUnRealized'];
      return summary;
    }, {
      aum: aumState
        .filter(aumData => selectedAccountIds.includes(aumData.accountId))
        .reduce((a, b) => a + b.aum, 0),
      cashToday: cashData
        .filter(cash => selectedAccountIds.includes(cash.accountId))
        .reduce(
        (acc, data) =>
          acc + data.cashToday,
        0
      ),
      cashYesterday: cashData
        .filter(cash => selectedAccountIds.includes(cash.accountId))
        .reduce(
        (acc, data) =>
          acc + data.cashYesterday,
        0
      ),
      realizedPnl: 0,
      totalMVUSD: 0,
      unRealizedPnl: 0
    })
);
