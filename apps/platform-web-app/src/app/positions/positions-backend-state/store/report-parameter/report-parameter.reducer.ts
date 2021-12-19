import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';

import { ReportParameter } from '@pnkl-frontend/shared';
import { LoadReportParameters } from './report-parameter.actions';

export interface State extends EntityState<ReportParameter> {
  // additional entities state properties
}

export const adapter: EntityAdapter<ReportParameter> = createEntityAdapter<
  ReportParameter
>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

const featureReducer = createReducer(
  initialState,
  on(LoadReportParameters, (state, { reportParameters }) => adapter.setAll(reportParameters, state))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal
} = adapter.getSelectors();
