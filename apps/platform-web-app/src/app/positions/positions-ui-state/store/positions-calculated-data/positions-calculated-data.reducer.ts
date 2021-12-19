import { Action, createReducer, on } from '@ngrx/store';
import { UpdatePositionsCalculatedData } from './positions-calculated-data.actions';

export interface State {
  calculatedData: any[];
}

export const initialState: State = {
  calculatedData: []
};

const featureReducer = createReducer(
  initialState,
  on(UpdatePositionsCalculatedData, (_, { data }) => ({
    calculatedData: data
  }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}
