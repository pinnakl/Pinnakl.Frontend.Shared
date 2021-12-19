import { Action } from '@ngrx/store';

import { PinnaklColDef } from '@pnkl-frontend/shared';
import { allPnlCalculatedColumns } from '../all-pnl-calculated-columns';

export interface State {
  entities: PinnaklColDef[];
}

export const initialState: State = {
  entities: allPnlCalculatedColumns
};

export function reducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    default:
      return state;
  }
}

export const selectEntities = (state: State) => state.entities;
