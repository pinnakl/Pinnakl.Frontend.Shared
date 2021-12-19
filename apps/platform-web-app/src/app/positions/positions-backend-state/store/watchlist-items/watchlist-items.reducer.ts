import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { WatchlistItem } from '@pnkl-frontend/shared';
import {
  AttemptLoadWatchlistItems,
  LoadWatchlistItems,
  LoadWatchlistItemsFailed
} from './watchlist-items.actions';

export interface State extends EntityState<WatchlistItem> {
  loaded: boolean;
  loading: boolean;
}

export const adapter: EntityAdapter<WatchlistItem> = createEntityAdapter<
  WatchlistItem
>();

export const initialState: State = adapter.getInitialState({
  loaded: false,
  loading: false
});

const featureReducer = createReducer(
  initialState,
  on(AttemptLoadWatchlistItems, (state) => ({ ...state, loaded: false, loading: true })),
  on(LoadWatchlistItems, (state, { watchlistItems }) => adapter.setAll(watchlistItems, {
    ...state,
    loaded: true,
    loading: false
  })),
  on(LoadWatchlistItemsFailed, (state) => ({ ...state, loaded: false, loading: false }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const { selectEntities, selectAll } = adapter.getSelectors();
export const selectLoaded = (state: State) => state.loaded;
