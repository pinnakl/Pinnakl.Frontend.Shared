import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { UserReportIdcColumn } from '@pnkl-frontend/shared';
import { LoadUserReportIdcColumns } from './user-report-idc-column.actions';

export interface State extends EntityState<UserReportIdcColumn> {
  // additional entities state properties
}

export const adapter: EntityAdapter<UserReportIdcColumn> = createEntityAdapter<
  UserReportIdcColumn
>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

const featureReducer = createReducer(
  initialState,
  on(LoadUserReportIdcColumns, (state, { userReportIdcColumns }) => adapter.setAll(userReportIdcColumns, state))
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
