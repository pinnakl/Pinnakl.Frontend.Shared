import { Action, createReducer, on } from '@ngrx/store';
import { DashboardMarketMacroStat } from '../../../dashboard-backend/dashboard-market-macro-stat/dashboard-market-macro-stat.model';
import {
  AttemptLoadDashboardMarketMacroStats,
  LoadDashboardMarketMacroStats,
  LoadDashboardMarketMacroStatsFailed
} from './dashboard-market-macro-stat.actions';

export interface State {
  entities: DashboardMarketMacroStat[];
  loaded: boolean;
  loading: boolean;
}

export const initialState: State = {
  entities: [],
  loaded: false,
  loading: false
};

const featureReducer = createReducer(
  initialState,
  on(AttemptLoadDashboardMarketMacroStats, (state) => ({
    ...state,
    loaded: false,
    loading: true
  })),
  on(LoadDashboardMarketMacroStats, (state, { entities }) => ({
    ...state,
    entities,
    loaded: true,
    loading: false
  })),
  on(LoadDashboardMarketMacroStatsFailed, (state) => ({
    ...state,
    loaded: false,
    loading: false
  }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const selectAll = (state: State) => state.entities;

export const selectLoaded = (state: State) => state.loaded;
