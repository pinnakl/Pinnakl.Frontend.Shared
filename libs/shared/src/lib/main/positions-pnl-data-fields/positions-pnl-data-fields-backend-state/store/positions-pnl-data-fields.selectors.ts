import { createFeatureSelector, createSelector } from '@ngrx/store';

import { selectAll, selectLoaded } from './positions-pnl-data-fields.reducer';

const selectFeature = createFeatureSelector('positionsPnlDataFieldsBackend');

export const selectPositionsPnlDataFields = createSelector(
  selectFeature,
  selectAll
);
export const selectPositionsPnlDataFieldsLoaded = createSelector(
  selectFeature,
  selectLoaded
);
