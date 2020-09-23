import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';

import * as fromAum from './aum.reducer';

export * from './aum.effects';

export interface State {
  aum: fromAum.State;
  accountsAum: fromAum.State[];
}

export const reducers: ActionReducerMap<State> = {
  aum: fromAum.reducer,
  accountsAum: fromAum.accountsReducer,
};

const selectAumFeature = createFeatureSelector<State>('aumBackend');

export const selectAumState = createSelector(
  selectAumFeature,
  state => state.aum
);

export const selectAccountsAumState = createSelector(
  selectAumFeature,
  state => state.accountsAum
);
