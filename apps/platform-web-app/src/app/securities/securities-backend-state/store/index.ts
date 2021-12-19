import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';

import * as fromSecurity from './security/security.reducer';

export interface State {
  security: fromSecurity.State;
}

export const reducers: ActionReducerMap<State> = {
  security: fromSecurity.reducer
};

const selectSecuritiesBackend = createFeatureSelector<State>(
  'securitiesBackend'
);

const selectSecurityState = createSelector(
  selectSecuritiesBackend,
  state => state.security
);
export const selectAllSecurities = createSelector(
  selectSecurityState,
  fromSecurity.selectAll
);
export const selectSecuritiesLoaded = createSelector(
  selectSecurityState,
  fromSecurity.selectLoaded
);
