import { Action, createReducer, on } from '@ngrx/store';
import { UpdatePositionsColumnsFilteredValues } from './positions-columns-filtered-values.actions';

export interface State {
  entities: {
    [key: string]: number[]
  };
}

export const initialState: State = {
  entities: null
};


const featureReducer = createReducer(
  initialState,
  on(UpdatePositionsColumnsFilteredValues, (_, { valuesHashMap }) => ({
    entities: valuesHashMap && {
      ...valuesHashMap
    }
  }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}
