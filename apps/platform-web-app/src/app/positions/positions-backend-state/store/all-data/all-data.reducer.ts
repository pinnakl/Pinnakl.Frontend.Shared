import { Action, createReducer, on } from '@ngrx/store';
import { AttemptLoadAllData, SetIsAllDataLoaded } from './all-data.actions';

const featureReducer = createReducer(
  false,
  on(SetIsAllDataLoaded, (_, { payload }) => payload),
  on(AttemptLoadAllData, (_, { payload }) => payload)
);

export function reducer(state: boolean | undefined, action: Action): boolean {
  return featureReducer(state, action);
}
