import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';
import * as fromPnlCalculatedAttribute from './pnl-calculated-attribute/pnl-calculated-attribute.reducer';

export interface State {
  pnlCalculatedAttribute: fromPnlCalculatedAttribute.State;
}

export const reducers: ActionReducerMap<State> = {
  pnlCalculatedAttribute: fromPnlCalculatedAttribute.reducer
};

const selectPnlBackend = createFeatureSelector<State>('pnlBackend');

// Pnl Calculated Attribute
const selectPnlCalculatedAttributeState = createSelector(
  selectPnlBackend,
  (state: State) => state.pnlCalculatedAttribute
);

export const selectPnlCalculatedAttributes = createSelector(
  selectPnlCalculatedAttributeState,
  fromPnlCalculatedAttribute.selectAll
);

export const selectPnlCalculatedAttributesLoaded = createSelector(
  selectPnlCalculatedAttributeState,
  fromPnlCalculatedAttribute.selectLoaded
);
