import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';

import {
  LoadPositionsReportParameterValues,
  UpdatePositionsReportParameterValues
} from './positions-report-parameter-value.actions';
import { PositionsReportParameterValue } from './positions-report-parameter-value.model';

export interface State extends EntityState<PositionsReportParameterValue> { }

export const adapter: EntityAdapter<PositionsReportParameterValue> = createEntityAdapter<
  PositionsReportParameterValue
>();

export const initialState: State = adapter.getInitialState({});

const featureReducer = createReducer(
  initialState,
  on(LoadPositionsReportParameterValues, (state, { positionsReportParameterValues }) => adapter.setAll(
    positionsReportParameterValues,
    state
  )),
  on(UpdatePositionsReportParameterValues, (state, { positionsReportParameterValues }) => adapter.updateMany(
    positionsReportParameterValues,
    state
  ))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const { selectAll } = adapter.getSelectors();
