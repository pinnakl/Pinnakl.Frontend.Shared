import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { ReportColumn } from '@pnkl-frontend/shared';
import { LoadReportColumns } from './report-column.actions';

export interface State extends EntityState<ReportColumn> {
  // additional entities state properties
}

export const adapter: EntityAdapter<ReportColumn> = createEntityAdapter<
  ReportColumn
>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

const featureReducer = createReducer(
  initialState,
  on(LoadReportColumns, (state, { reportColumns }) => adapter.setAll(reportColumns, state))
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
