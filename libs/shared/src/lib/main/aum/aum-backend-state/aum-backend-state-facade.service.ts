import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

import { selectAumState, State } from './store';
import { AttemptLoadAum } from './store/aum.actions';

// TODO: Write tests
@Injectable()
export class AumBackendStateFacade {
  constructor(private _store: Store<State>) {}

  aum$ = this._store.pipe(select(selectAumState));
  aumValue$ = this.aum$.pipe(map(aum => aum.aum));

  loadAum({ accountId, date }: { accountId: number; date: Date }): void {
    this._store.dispatch(new AttemptLoadAum({ accountId, date }));
  }
}
