import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';

import { UserReportColumn } from '@pnkl-frontend/shared';
import { LoadUserReportColumns } from './user-report-column.actions';

export interface State extends EntityState<UserReportColumn> {
  // additional entities state properties
}

export const adapter: EntityAdapter<UserReportColumn> = createEntityAdapter<
  UserReportColumn
>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

const featureReducer = createReducer(
  initialState,
  on(LoadUserReportColumns, (state, { userReportColumns }) => adapter.setAll(userReportColumns, state))
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
