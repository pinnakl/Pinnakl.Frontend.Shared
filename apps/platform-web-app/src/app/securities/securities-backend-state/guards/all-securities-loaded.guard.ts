import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { select } from '@ngrx/store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';

import { selectSecuritiesLoaded, State } from '../store';
import { AttemptLoadSecurities } from '../store/security';

@Injectable()
export class AllSecuritiesLoadedGuard implements CanActivate {
  canActivate(): Observable<boolean> {
    return this.securitiesLoaded();
  }

  private securitiesLoaded(): Observable<boolean> {
    return this.store.pipe(
      select(selectSecuritiesLoaded),
      tap(loaded => {
        if (loaded) {
          return;
        }
        this.store.dispatch(AttemptLoadSecurities());
      }),
      filter(loaded => loaded),
      take(1)
    );
  }

  constructor(private readonly store: Store<State>) {}
}
