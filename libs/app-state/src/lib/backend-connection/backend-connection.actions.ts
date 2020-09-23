import { Action } from '@ngrx/store';

export enum BackendConnectionActionTypes {
  SetReconnectedAt = '[BackendConnection] Set ReconnectedAt'
}

export class SetReconnectedAt implements Action {
  readonly type = BackendConnectionActionTypes.SetReconnectedAt;
  constructor(public payload: { reconnectedAt: Date }) {}
}

export type BackendConnectionActions = SetReconnectedAt;
