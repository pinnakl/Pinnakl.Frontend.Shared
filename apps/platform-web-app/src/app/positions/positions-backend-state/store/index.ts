import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';

import { selectAccountsAumState } from '@pnkl-frontend/shared';
import * as fromAllData from '../store/all-data/all-data.reducer';
import * as fromCashData from '../store/cash-data/cash-data.reducer';
import * as fromClientReportColumn from '../store/client-report-column/client-report-column.reducer';
import * as fromCustomAttribute from '../store/custom-attribute/custom-attribute.reducer';
import * as fromIdcColumn from '../store/idc-column/idc-column.reducer';
import * as fromPositionReportInfo from './position-report-info/position-report-info.reducer';
import * as fromPositionsCalculatedData from './positions-calculated-all-data';
import * as fromPositionsPnlValues from './positions-pnl-values/positions-pnl-values.reducer';
import * as fromPositionReportData from './positions-report-data/positions-report-data.reducer';
import * as fromReportColumn from './report-column/report-column.reducer';
import * as fromReportParameter from './report-parameter/report-parameter.reducer';
import * as fromPositionSecurityPricesAlerts from './security-prices-alerts/security-prices-alerts.reducer';
import * as fromUserReportColumn from './user-report-column/user-report-column.reducer';
import * as fromUserReportCustomAttribute from './user-report-custom-attribute-column/user-report-custom-attribute.reducer';
import * as fromUserReportIdcColumn from './user-report-idc-column/user-report-idc-column.reducer';
import * as fromWatchListItems from './watchlist-items/watchlist-items.reducer';

export interface State {
  clientReportColumn: fromClientReportColumn.State;
  customAttribute: fromCustomAttribute.State;
  idcColumn: fromIdcColumn.State;
  positionReportData: fromPositionReportData.State;
  positionReportInfo: fromPositionReportInfo.State;
  reportColumn: fromReportColumn.State;
  reportParameter: fromReportParameter.State;
  userReportColumn: fromUserReportColumn.State;
  userReportCustomAttribute: fromUserReportCustomAttribute.State;
  userReportIdcColumn: fromUserReportIdcColumn.State;
  positionSecurityPricesAlerts: fromPositionSecurityPricesAlerts.State;
  positionWatchlistItems: fromWatchListItems.State;
  pnlValues: fromPositionsPnlValues.State;
  cashData: fromCashData.State;
  positionsCalculatedAllData: fromPositionsCalculatedData.State;
  isLoaded: boolean;
}

export const reducers: ActionReducerMap<State> = {
  clientReportColumn: fromClientReportColumn.reducer,
  customAttribute: fromCustomAttribute.reducer,
  idcColumn: fromIdcColumn.reducer,
  positionReportData: fromPositionReportData.reducer,
  positionReportInfo: fromPositionReportInfo.reducer,
  reportColumn: fromReportColumn.reducer,
  reportParameter: fromReportParameter.reducer,
  userReportColumn: fromUserReportColumn.reducer,
  userReportCustomAttribute: fromUserReportCustomAttribute.reducer,
  userReportIdcColumn: fromUserReportIdcColumn.reducer,
  positionSecurityPricesAlerts: fromPositionSecurityPricesAlerts.reducer,
  positionWatchlistItems: fromWatchListItems.reducer,
  pnlValues: fromPositionsPnlValues.reducer,
  cashData: fromCashData.reducer,
  positionsCalculatedAllData: fromPositionsCalculatedData.reducer,
  isLoaded: fromAllData.reducer
};

const selectPositionsBackend = createFeatureSelector<State>('positionsBackend');

// PositionsCalculatedData Selectors
export const selectPositionsCalculatedAllData = createSelector(
  selectPositionsBackend,
  (state: State) => state.positionsCalculatedAllData.calculatedData
);

const selectPositionsClientReportColumnState = createSelector(
  selectPositionsBackend,
  (state: State) => state.clientReportColumn
);

export const selectPositionsIsLoaded = createSelector(
  selectPositionsBackend,
  (state: State) => state.isLoaded
);

const featureSelector = createFeatureSelector<State>('positionsUi');
export const selectPositionsColumnsFilteredValues = createSelector(
  featureSelector,
  (state: State) => (state as any).positionsColumnsFilteredValues
);

const selectCashDataState = createSelector(
  selectPositionsBackend,
  (state: State) => state.cashData
);

export const selectCashData = createSelector(
  selectCashDataState,
  fromCashData.selectCashData
);

export const selectAllPositionsClientReportColumns = createSelector(
  selectPositionsClientReportColumnState,
  fromClientReportColumn.selectAll
);

const selectPositionsReportColumnState = createSelector(
  selectPositionsBackend,
  (state: State) => state.reportColumn
);

export const selectAllPositionsReportColumns = createSelector(
  selectPositionsReportColumnState,
  fromReportColumn.selectAll
);

const selectPositionsReportDataState = createSelector(
  selectPositionsBackend,
  (state: State) => state.positionReportData
);
export const selectAllPositionsReportData = createSelector(
  selectPositionsReportDataState,
  fromPositionReportData.selectAll
);

const selectPositionsReportParameterState = createSelector(
  selectPositionsBackend,
  (state: State) => state.reportParameter
);

export const selectAllPositionsReportParameters = createSelector(
  selectPositionsReportParameterState,
  fromReportParameter.selectAll
);

const selectPositionsUserReportColumnState = createSelector(
  selectPositionsBackend,
  (state: State) => state.userReportColumn
);

export const selectAllPositionsUserReportColumns = createSelector(
  selectPositionsUserReportColumnState,
  fromUserReportColumn.selectAll
);

const selectPositionsUserReportCustomAttribueState = createSelector(
  selectPositionsBackend,
  (state: State) => state.userReportCustomAttribute
);

export const selectAllPositionsUserReportCustomAttribueColumns = createSelector(
  selectPositionsUserReportCustomAttribueState,
  fromUserReportCustomAttribute.selectAll
);

const selectPositionsUserIdcColumnState = createSelector(
  selectPositionsBackend,
  (state: State) => state.userReportIdcColumn
);

export const selectAllPositionsUserIdcColumns = createSelector(
  selectPositionsUserIdcColumnState,
  fromUserReportIdcColumn.selectAll
);

const selectSecurityCustomAttributesState = createSelector(
  selectPositionsBackend,
  (state: State) => state.customAttribute
);

export const selectAllSecurityCustomAttributes = createSelector(
  selectSecurityCustomAttributesState,
  fromCustomAttribute.selectAll
);

const selectIdcColumnsState = createSelector(
  selectPositionsBackend,
  (state: State) => state.idcColumn
);

export const selectAllIdcColumns = createSelector(
  selectIdcColumnsState,
  fromIdcColumn.selectAll
);

const selectPositionsReportInfoState = createSelector(
  selectPositionsBackend,
  (state: State) => state.positionReportInfo
);

const selectAllSecurityPricesState = createSelector(
  selectPositionsBackend,
  (state: State) => state.positionSecurityPricesAlerts
);

const selectAllWatchlistItemsState = createSelector(
  selectPositionsBackend,
  (state: State) => state.positionWatchlistItems
);

export const selectAllSecurityPricesAlerts = createSelector(
  selectAllSecurityPricesState,
  fromPositionSecurityPricesAlerts.selectAll
);

export const selectAllWatchlistItems = createSelector(
  selectAllWatchlistItemsState,
  fromWatchListItems.selectAll
);

export const selectPositionsReportLoaded = createSelector(
  selectPositionsReportInfoState,
  fromPositionReportInfo.selectLoaded
);

export const selectIdcColumnsLoaded = createSelector(
  selectIdcColumnsState,
  fromIdcColumn.selectLoaded
);

export const selectSecurityCustomAttributesLoaded = createSelector(
  selectSecurityCustomAttributesState,
  fromCustomAttribute.selectLoaded
);

export const selectPositionsDataLoaded = createSelector(
  selectPositionsReportDataState,
  fromPositionReportData.selectLoaded
);

export const selectPositionsPnlValues = createSelector(
  selectPositionsBackend,
  state => state.pnlValues
);

// Take all report data needed for calculations
export const selectAllPositionsReportDataInfo = createSelector(
  selectAllPositionsReportData,
  selectAccountsAumState,
  selectAllPositionsReportColumns,
  selectPositionsColumnsFilteredValues,
  (data, aum, allColumns, filters) => ({
    reportData: data,
    allColumns,
    aum,
    filters
  })
);

export const selectAccountsPnlValuesMap = createSelector(
  selectAccountsAumState,
  selectPositionsCalculatedAllData,
  (aumState, gridData) => {
    const accountIds = Array.from(new Set(aumState.map(i => i.accountId)));

    const accountsPnlValuesMap = {};
    for (const accId of accountIds) {
      accountsPnlValuesMap[accId] = 0;
    }

    gridData.forEach(data => accountsPnlValuesMap[data.AccountId] += (data['pnlRealized'] + data['pnlUnRealized']));
    for (const accId of accountIds) {
      accountsPnlValuesMap[accId] = {
        plVal: Math.round(accountsPnlValuesMap[accId] * 100) / 100,
        plPct: Math.round(accountsPnlValuesMap[accId] / aumState.find(a => a.accountId === accId).aum * 1000000) / 10000
      };
    }

    return accountsPnlValuesMap;
  }
);
