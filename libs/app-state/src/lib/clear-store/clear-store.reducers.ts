import { ActionReducer } from '@ngrx/store';

import {
  ClearStoreActions,
  ClearStoreActionTypes
} from './clear-store.actions';

export function clearStore(
  reducer: ActionReducer<any>
): (state: any, action: ClearStoreActions) => any {
  return function(state: any, action: ClearStoreActions): any {
    if (action.type === ClearStoreActionTypes.ClearStore) {
      state = undefined;
    }

    return reducer(state, action);
  };
}
