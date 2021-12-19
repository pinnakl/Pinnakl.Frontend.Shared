import { createAction, props } from '@ngrx/store';

export enum BackendConnectionActionTypes {
  SetReconnectedAt = '[BackendConnection] Set ReconnectedAt'
}


export const SetReconnectedAt = createAction(
  BackendConnectionActionTypes.SetReconnectedAt,
  props<{ reconnectedAt: Date }>()
);
