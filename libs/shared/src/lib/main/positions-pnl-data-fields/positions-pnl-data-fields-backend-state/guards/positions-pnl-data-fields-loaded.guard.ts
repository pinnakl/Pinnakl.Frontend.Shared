import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, first, tap } from 'rxjs/operators';

import {
  AttemptLoadPositionsPnlDataFields,
  selectPositionsPnlDataFieldsLoaded
} from '../store';

@Injectable()
export class PositionsPnlDataFieldsLoadedGuard implements CanActivate {
  constructor(private store: Store<any>) {}

  canActivate(): Observable<boolean> {
    return this.store.pipe(
      select(selectPositionsPnlDataFieldsLoaded),
      tap(loaded => {
        if (loaded) {
          return;
        }
        this.store.dispatch(new AttemptLoadPositionsPnlDataFields());
      }),
      filter(loaded => loaded),
      first()
    );
  }
}
