import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

import { RecommendedAction } from '../../../dashboard-backend';
import {
  RecommendedActionActions,
  RecommendedActionsActionTypes
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

export function reducer(
  state: State = initialState,
  action: RecommendedActionActions
): State {
  switch (action.type) {
    case RecommendedActionsActionTypes.AddRecommendedAction: {
      return adapter.addOne(action.payload.recommendedAction, {
        ...state,
        loading: false,
        loaded: true
      });
    }

    case RecommendedActionsActionTypes.AttemptLoadRecommendedActions: {
      return { ...state, loaded: false, loading: true };
    }

    case RecommendedActionsActionTypes.LoadRecommendedActions: {
      return adapter.addAll(action.payload.recommendedActions, {
        ...state,
        loading: false,
        loaded: true
      });
    }

    case RecommendedActionsActionTypes.UpdateRecommendedAction: {
      return adapter.updateOne(action.payload.recommendedAction, state);
    }

    case RecommendedActionsActionTypes.LoadRecommendedActionsFailed: {
      return { ...state, loaded: false, loading: false };
    }
    default: {
      return state;
    }
  }
}

export const selectLoaded = (state: State) => state.loaded;

export const { selectAll } = adapter.getSelectors();
