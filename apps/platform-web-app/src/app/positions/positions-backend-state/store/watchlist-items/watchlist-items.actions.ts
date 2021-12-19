import { createAction, props } from '@ngrx/store';
import { WatchlistItem } from '@pnkl-frontend/shared';

export enum WatchlistItemActionTypes {
  AttemptLoadWatchlistItems = '[WatchlistItem] Attempt Load WatchlistItems',
  LoadWatchlistItems = '[WatchlistItem] Load WatchlistItems',
  LoadWatchlistItemsFailed = '[WatchlistItem] Load WatchlistItems Failed'
}


export const AttemptLoadWatchlistItems = createAction(
  WatchlistItemActionTypes.AttemptLoadWatchlistItems
);

export const LoadWatchlistItems = createAction(
  WatchlistItemActionTypes.LoadWatchlistItems,
  props<{ watchlistItems: WatchlistItem[] }>()
);

export const LoadWatchlistItemsFailed = createAction(
  WatchlistItemActionTypes.LoadWatchlistItemsFailed,
  props<{ error: any }>()
);
