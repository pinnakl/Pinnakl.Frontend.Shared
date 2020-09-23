import { DashboardMarketMacroStat } from '../../../dashboard-backend';
import {
  DashboardMarketMacroStatActions,
  DashboardMarketMacroStatActionTypes
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

export function reducer(
  state: State = initialState,
  action: DashboardMarketMacroStatActions
): State {
  switch (action.type) {
    case DashboardMarketMacroStatActionTypes.AttemptLoadDashboardMarketMacroStats:
      return {
        ...state,
        loaded: false,
        loading: true
      };
    case DashboardMarketMacroStatActionTypes.LoadDashboardMarketMacroStats:
      return {
        ...state,
        entities: action.payload.entities,
        loaded: true,
        loading: false
      };
    case DashboardMarketMacroStatActionTypes.LoadDashboardMarketMacroStatsFailed:
      return {
        ...state,
        loaded: false,
        loading: false
      };
    default:
      return state;
  }
}

export const selectAll = (state: State) => state.entities;

export const selectLoaded = (state: State) => state.loaded;
