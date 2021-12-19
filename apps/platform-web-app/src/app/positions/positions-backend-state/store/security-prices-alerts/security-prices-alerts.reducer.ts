import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { SecurityPriceAlert } from '@pnkl-frontend/shared';
import {
  AttemptLoadSecurityPriceAlerts,
  LoadSecurityPriceAlerts,
  LoadSecurityPriceAlertsFailed
} from './security-prices-alerts.actions';

export interface State extends EntityState<SecurityPriceAlert> {
  loaded: boolean;
  loading: boolean;
}

export const adapter: EntityAdapter<SecurityPriceAlert> = createEntityAdapter<
  SecurityPriceAlert
>();

export const initialState: State = adapter.getInitialState({
  loaded: false,
  loading: false
});

const featureReducer = createReducer(
  initialState,
  on(AttemptLoadSecurityPriceAlerts, (state) => ({ ...state, loaded: false, loading: true })),
  on(LoadSecurityPriceAlerts, (state, { securityPriceAlerts }) => adapter.setAll(securityPriceAlerts, {
    ...state,
    loaded: true,
    loading: false
  })),
  on(LoadSecurityPriceAlertsFailed, (state) => ({ ...state, loaded: false, loading: false }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const { selectEntities, selectAll } = adapter.getSelectors();
export const selectLoaded = (state: State) => state.loaded;
