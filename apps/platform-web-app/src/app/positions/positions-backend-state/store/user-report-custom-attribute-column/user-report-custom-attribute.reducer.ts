import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { UserReportCustomAttribute } from '@pnkl-frontend/shared';
import { LoadUserReportCustomAttributes } from './user-report-custom-attribute.actions';

export interface State extends EntityState<UserReportCustomAttribute> {
  // additional entities state properties
}

export const adapter: EntityAdapter<UserReportCustomAttribute> = createEntityAdapter<
  UserReportCustomAttribute
>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

const featureReducer = createReducer(
  initialState,
  on(LoadUserReportCustomAttributes, (state, { userReportCustomAttributes }) => adapter.setAll(userReportCustomAttributes, state))
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
