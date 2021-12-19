import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, first, tap } from 'rxjs/operators';

import {
  AttemptLoadTradeWorkflowSpecs,
  selectTradeWorkflowSpecsLoaded
} from '../store';

@Injectable()
export class AllTradeWorkflowSpecsLoadedGuard implements CanActivate {
  canActivate(): Observable<boolean> {
    return this._store.pipe(
      select(selectTradeWorkflowSpecsLoaded),
      tap(loaded => {
        if (loaded) {
          return;
        }
        this._store.dispatch(AttemptLoadTradeWorkflowSpecs());
      }),
      filter(loaded => loaded),
      first()
    );
  }

  constructor(private readonly _store: Store<any>) {}
}
