import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';

import * as fromPnlCalculatedColumns from './pnl-calculated-columns';
import * as fromPnlCalculatedColumnsSelected from './pnl-calculated-columns-selected';
import * as fromPnlFieldsSelected from './pnl-fields-selected/pnl-fields-selected.reducer';
import * as fromPnlFilters from './pnl-filters/pnl-filters.reducer';
export * from './pnl-filters';
export * from './real-time-pnl';
export * from './pnl-fields-selected/pnl-fields-selected.actions';
export * from './pnl-calculated-columns-selected/pnl-calculated-columns-selected.actions';

export interface State {
  pnlCalculatedColumns: fromPnlCalculatedColumns.State;
  pnlCalculatedColumnsSelected: fromPnlCalculatedColumnsSelected.State;
  pnlFieldsSelected: fromPnlFieldsSelected.State;
  pnlFilters: fromPnlFilters.State;
}

export const reducers: ActionReducerMap<State> = {
  pnlCalculatedColumns: fromPnlCalculatedColumns.reducer,
  pnlCalculatedColumnsSelected: fromPnlCalculatedColumnsSelected.reducer,
  pnlFieldsSelected: fromPnlFieldsSelected.reducer,
  pnlFilters: fromPnlFilters.reducer
};

const selectPnlUi = createFeatureSelector<State>('pnlUi');

// PnlCalculatedColumns
const selectPnlCalculatedColumnsState = createSelector(
  selectPnlUi,
  state => state.pnlCalculatedColumns
);
const selectPnlCalculatedColumns = createSelector(
  selectPnlCalculatedColumnsState,
  fromPnlCalculatedColumns.selectEntities
);

// PnlCalculatedColumnsSelected
const selectPnlCalculatedColumnsSelectedState = createSelector(
  selectPnlUi,
  state => state.pnlCalculatedColumnsSelected
);
const selectPnlCalculatedColumnsSelectedNames = createSelector(
  selectPnlCalculatedColumnsSelectedState,
  fromPnlCalculatedColumnsSelected.selectEntities
);
export const selectPnlCalculatedColumnsSelected = createSelector(
  selectPnlCalculatedColumns,
  selectPnlCalculatedColumnsSelectedNames,
  (columns, selectedColumnNames) =>
    columns.filter(({ headerName }) => selectedColumnNames.includes(headerName))
);
export interface PnlCalculatedColumnSelection {
  name: string;
  selected: boolean;
}
export const selectPnlCalculatedColumnSelections = createSelector(
  selectPnlCalculatedColumns,
  selectPnlCalculatedColumnsSelectedNames,
  (columns, selectedColumnNames) =>
    columns.map(
      ({ headerName }) =>
        <PnlCalculatedColumnSelection>{
          name: headerName,
          selected: selectedColumnNames.includes(headerName)
        }
    )
);

// PnlFieldsSelected
const selectPnlFieldsSelectedState = createSelector(
  selectPnlUi,
  state => state.pnlFieldsSelected
);
export const selectPnlFieldsSelected = createSelector(
  selectPnlFieldsSelectedState,
  fromPnlFieldsSelected.selectIds
);
export const selectInitialPnlFieldsSelected = createSelector(
  selectPnlFieldsSelectedState,
  fromPnlFieldsSelected.selectInitialIds
);

// PnlFilters
const selectPnlFilters = createSelector(
  selectPnlUi,
  state => state.pnlFilters
);
export const selectPnlFilterValue = createSelector(
  selectPnlFilters,
  fromPnlFilters.selectFilterValue
);
export const selectPnlFilterVisible = createSelector(
  selectPnlFilters,
  fromPnlFilters.selectFilterVisible
);
