import { Action } from '@ngrx/store';

export enum ClearStoreActionTypes {
  ClearStore = '[Clear Store] Clears store'
}

export class ClearStore implements Action {
  readonly type = ClearStoreActionTypes.ClearStore;
}

export type ClearStoreActions = ClearStore;
