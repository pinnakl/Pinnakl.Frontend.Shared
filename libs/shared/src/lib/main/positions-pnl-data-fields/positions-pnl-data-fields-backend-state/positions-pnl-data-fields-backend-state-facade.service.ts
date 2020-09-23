import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import {
  selectPositionsPnlDataFields,
  selectPositionsPnlDataFieldsLoaded
} from './store';

@Injectable()
export class PositionsPnlDataFieldsBackendStateFacade {
  constructor(private store: Store<any>) {}

  positionsPnlDataFields$ = this.store.pipe(
    select(selectPositionsPnlDataFields)
  );
  positionsPnlDataFieldsLoaded$ = this.store.pipe(
    select(selectPositionsPnlDataFieldsLoaded)
  );
}
