import { Action, createReducer, on } from '@ngrx/store';
import { PnlFilter } from '../../../pnl-backend/pnl-calculated/pnl-calculated-filter.model';
import { HideFilter, SetPnlFilter, ShowFilter, ToggleFilter } from './pnl-filters.actions';

export interface State {
  filterValue?: PnlFilter;
  filterVisible: boolean;
}

export const initialState: State = { filterValue: null, filterVisible: false };


const featureReducer = createReducer(
  initialState,
  on(HideFilter, (state) => ({ ...state, filterVisible: false })),
  on(ToggleFilter, (state) => ({ ...state, filterVisible: !state.filterVisible })),
  on(SetPnlFilter, (state, { payload }) => ({ ...state, filterValue: payload })),
  on(ShowFilter, (state) => ({ ...state, filterVisible: true }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const selectFilterValue = (state: State) => state.filterValue;
export const selectFilterVisible = (state: State) => state.filterVisible;
