import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { select } from '@ngrx/store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';

import { selectCurrenciesLoaded, State } from '../store';
import { AttemptLoadCurrencies } from '../store/currency';

@Injectable()
export class AllCurrenciesLoadedGuard implements CanActivate {
  canActivate(): Observable<boolean> {
    return this.entitiesLoaded();
  }

  private entitiesLoaded(): Observable<boolean> {
    return this.store.pipe(
      select(selectCurrenciesLoaded),
      tap(loaded => {
        if (loaded) {
          return;
        }
        this.store.dispatch(AttemptLoadCurrencies());
      }),
      filter(loaded => loaded),
      take(1)
    );
  }

  constructor(private readonly store: Store<State>) {}
}
