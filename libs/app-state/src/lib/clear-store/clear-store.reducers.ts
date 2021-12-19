import { ActionReducer } from '@ngrx/store';

import {
	ClearStore,
  ClearStoreActionTypes
} from './clear-store.actions';

export function clearStore(
  reducer: ActionReducer<any>
): (state: any, action: typeof ClearStore) => any {
  return function(state: any, action: typeof ClearStore): any {
    if (action.type === ClearStoreActionTypes.ClearStore) {
      state = undefined;
    }

    return reducer(state, action);
  };
}
