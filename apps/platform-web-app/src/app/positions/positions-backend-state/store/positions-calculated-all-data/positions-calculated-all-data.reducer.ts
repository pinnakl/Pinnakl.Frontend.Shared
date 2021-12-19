import { Action, createReducer, on } from '@ngrx/store';
import { UpdatePositionsCalculatedAllData } from './positions-calculated-all-data.actions';

export interface State {
  calculatedData: any[];
}

export const initialState: State = {
  calculatedData: []
};

const featureReducer = createReducer(
  initialState,
  on(UpdatePositionsCalculatedAllData, (_, { data }) => ({ calculatedData: data }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}
