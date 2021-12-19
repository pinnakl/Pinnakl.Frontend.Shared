import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';

import { RecommendedAction } from '../../../dashboard-backend/recommended-actions/recommended-action.model';
import {
  AddRecommendedAction,
  AttemptLoadRecommendedActions,
  LoadRecommendedActions,
  LoadRecommendedActionsFailed,
  UpdateRecommendedAction
} from './recommended-actions.actions';

export interface State extends EntityState<RecommendedAction> {
  loading: boolean;
  loaded: boolean;
}

export const adapter: EntityAdapter<RecommendedAction> = createEntityAdapter<
  RecommendedAction
>();

export const initialState: State = adapter.getInitialState({
  loaded: false,
  loading: false
});

const featureReducer = createReducer(
  initialState,
  on(AddRecommendedAction, (state, { recommendedAction }) => adapter.addOne(recommendedAction, {
    ...state,
    loading: false,
    loaded: true
  })),
  on(AttemptLoadRecommendedActions, (state) => ({ ...state, loaded: false, loading: true })),
  on(LoadRecommendedActions, (state, { recommendedActions }) => adapter.setAll(recommendedActions, {
    ...state,
    loading: false,
    loaded: true
  })),
  on(UpdateRecommendedAction, (state, { recommendedAction }) => adapter.updateOne(recommendedAction, state)),
  on(LoadRecommendedActionsFailed, (state) => ({ ...state, loaded: false, loading: false }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const selectLoaded = (state: State) => state.loaded;

export const { selectAll } = adapter.getSelectors();
