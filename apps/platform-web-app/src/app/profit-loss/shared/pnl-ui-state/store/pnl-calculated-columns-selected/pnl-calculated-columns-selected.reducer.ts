import { Action, createReducer, on } from '@ngrx/store';
import { allPnlCalculatedColumns } from '../all-pnl-calculated-columns';
import {
  AddPnlCalculatedColumnsSelected,
  RemovePnlCalculatedColumnsSelected
} from './pnl-calculated-columns-selected.actions';

export interface State {
  entities: string[];
}

export const initialState: State = {
  entities: allPnlCalculatedColumns.map(({ headerName }) => headerName)
};

const featureReducer = createReducer(
  initialState,
  on(AddPnlCalculatedColumnsSelected, (state, { column }) => ({
    entities: [...state.entities, column]
  })),
  on(RemovePnlCalculatedColumnsSelected, (state, { column }) => ({
    entities: state.entities.filter(c => c !== column)
  }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const selectEntities = (state: State) => state.entities;
