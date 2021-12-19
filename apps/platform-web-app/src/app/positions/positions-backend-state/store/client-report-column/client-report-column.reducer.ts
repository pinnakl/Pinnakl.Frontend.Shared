import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { ClientReportColumn } from '@pnkl-frontend/shared';
import { LoadClientReportColumns } from './client-report-column.actions';

export interface State extends EntityState<ClientReportColumn> {
  // additional entities state properties
}

export const adapter: EntityAdapter<ClientReportColumn> = createEntityAdapter<
  ClientReportColumn
>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

const featureReducer = createReducer(
  initialState,
  on(LoadClientReportColumns, (state, { clientReportColumns }) => adapter.setAll(clientReportColumns, state))
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
