import { createAction } from '@ngrx/store';

export enum ClearStoreActionTypes {
  ClearStore = '[Clear Store] Clears store'
}


export const ClearStore = createAction(
  ClearStoreActionTypes.ClearStore
);
