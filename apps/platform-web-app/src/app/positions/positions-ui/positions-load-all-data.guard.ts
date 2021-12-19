import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';

import { selectPositionsIsLoaded, State } from '../positions-backend-state/store';
import { AttemptLoadAllData } from '../positions-backend-state/store/all-data/all-data.actions';

@Injectable()
export class PositionsLoadAllDataGuard implements CanActivate {
  constructor(private readonly store: Store<State>) {}

  canActivate(): Observable<boolean> {
    return this.store.select(selectPositionsIsLoaded).pipe(
      tap(isLoaded => {
        if (isLoaded) {
          return;
        }
        this.store.dispatch(AttemptLoadAllData({ payload: false }));
      }),
      filter(isLoaded => isLoaded),
      take(1)
    );
  }
}
