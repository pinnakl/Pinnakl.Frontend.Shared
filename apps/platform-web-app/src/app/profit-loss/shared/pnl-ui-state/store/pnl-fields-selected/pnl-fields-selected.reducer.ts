import { Action, createReducer, on } from '@ngrx/store';
import { RemoveField, SelectFields, SelectInitialFields } from './pnl-fields-selected.actions';

export interface State {
  ids?: number[];
  initialIds?: number[];
}

export const initialState: State = {
  ids: null,
  initialIds: null
};

const featureReducer = createReducer(
  initialState,
  on(RemoveField, (state, { id }) => ({
    ...state,
    // initialIds is using for widgets
    initialIds: state.initialIds.filter(i => i !== id)
  })),
  on(SelectFields, (state, { ids }) => ({ ...state, ids: ids.filter(id => id !== 0) })),
  on(SelectInitialFields, (state, { ids }) => ({
    ...state,
    // initialIds is using for widgets
    initialIds: ids.filter(id => id !== 0)
  }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const selectIds = (state: State) => state.ids;
export const selectInitialIds = (state: State) => state.initialIds;
