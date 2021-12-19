import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { select } from '@ngrx/store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';
import { selectRecommendedActionsLoaded, State } from '../store';
import { AttemptLoadRecommendedActions } from '../store/recommended-actions';

@Injectable()
export class RecommendedActionsLoadedGuard implements CanActivate {
  canActivate(): Observable<boolean> {
    return this.recommendedActionsLoaded();
  }

  constructor(private readonly store: Store<State>) {}

  private recommendedActionsLoaded(): Observable<boolean> {
    return this.store.pipe(
      select(selectRecommendedActionsLoaded),
      tap(loaded => {
        if (loaded) {
          return;
        }
        this.store.dispatch(AttemptLoadRecommendedActions());
      }),
      filter(loaded => !!loaded),
      take(1)
    );
  }
}
