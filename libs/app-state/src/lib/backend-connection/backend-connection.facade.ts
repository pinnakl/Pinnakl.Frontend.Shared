import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { SetReconnectedAt } from './backend-connection.actions';
import {
  selectBackendReconnectedAt,
  State as BackendConnectionState
} from './backend-connection.reducer';

@Injectable()
export class BackendConnectionFacade {
  constructor(private readonly _store: Store<BackendConnectionState>) {}

  reconnectedAt$ = this._store.select(selectBackendReconnectedAt);

  setReconnectedAt(reconnectedAt: Date): void {
    this._store.dispatch(SetReconnectedAt({ reconnectedAt }));
  }
}
