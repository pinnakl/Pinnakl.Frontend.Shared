import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, first, tap } from 'rxjs/operators';

import {
  AttemptLoadUserScreenSettings,
  selectUserScreenSettingsLoaded
} from '../store';

@Injectable()
export class UserScreenSettingsLoadedGuard implements CanActivate {
  canActivate(): Observable<boolean> {
    return this.entitiesLoaded();
  }

  private entitiesLoaded(): Observable<boolean> {
    return this.store.pipe(
      select(selectUserScreenSettingsLoaded),
      tap(loaded => {
        if (loaded) {
          return;
        }
        this.store.dispatch(new AttemptLoadUserScreenSettings());
      }),
      filter(loaded => loaded),
      first()
    );
  }

  constructor(private store: Store<any>) {}
}
