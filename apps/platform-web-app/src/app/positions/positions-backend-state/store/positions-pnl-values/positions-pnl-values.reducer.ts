import { Action, createReducer, on } from '@ngrx/store';
import { PositionsPnlValueModel } from '@pnkl-frontend/shared';
import { AddPnlValue, InitializePnlValues } from './positions-pnl-values.actions';

export type State = PositionsPnlValueModel[];

export const initialState: State = [];

const featureReducer = createReducer(
  initialState,
  on(InitializePnlValues, (_, { payload }) => ([...payload])),
  on(AddPnlValue, (_, { payload }) => ([...payload]))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}
