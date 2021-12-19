import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap } from 'rxjs/operators';

import { PositionService } from '@pnkl-frontend/shared';
import {
  AttemptLoadWatchlistItems,
  LoadWatchlistItems,
  LoadWatchlistItemsFailed
} from './watchlist-items.actions';

@Injectable()
export class WatchlistItemEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(AttemptLoadWatchlistItems),
    concatMap(async () => {
      try {
        const watchlistItems = await this.positionService.getWatchlistItems();
        return LoadWatchlistItems({ watchlistItems });
      } catch (error) {
        return LoadWatchlistItemsFailed({ error });
      }
    })
  ));

  constructor(
    private readonly actions$: Actions,
    private readonly positionService: PositionService
  ) {}
}
