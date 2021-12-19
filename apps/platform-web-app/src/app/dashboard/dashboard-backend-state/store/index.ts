import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';

import * as fromDashboardMarketMacroStat from './dashboard-market-macro-stat';
import * as fromDashboardBackend from './dashboard/dashboard-backend.reducer';
import * as fromRecommendedActions from './recommended-actions/recommended-actions.reducer';

export interface State {
  dashboardBackend: fromDashboardBackend.State;
  dashboardMarketMacroStat: fromDashboardMarketMacroStat.State;
  recommendedActions: fromRecommendedActions.State;
}

export const reducers: ActionReducerMap<State> = {
  dashboardBackend: fromDashboardBackend.reducer,
  dashboardMarketMacroStat: fromDashboardMarketMacroStat.reducer,
  recommendedActions: fromRecommendedActions.reducer
};

const selectDashboardBackend = createFeatureSelector<State>('dashboardBackend');

const selectDashboardBackendState = createSelector(
  selectDashboardBackend,
  (state: State) => state.dashboardBackend
);

export const selectDashboardAttributes = createSelector(
  selectDashboardBackendState,
  fromDashboardBackend.selectAll
);

export const selectDashboardPnl = createSelector(
  selectDashboardBackendState,
  fromDashboardBackend.selectPnl
);

export const selectDashboardActions = createSelector(
  selectDashboardBackendState,
  fromDashboardBackend.selectActions
);

export const selectDashboardFulfilledTasks = createSelector(
  selectDashboardBackendState,
  fromDashboardBackend.selectFulfilledTasks
);

export const selectDashboardClientConnectivity = createSelector(
  selectDashboardBackendState,
  fromDashboardBackend.selectClientConnectivity
);

export const selectDashboardAlerts = createSelector(
  selectDashboardBackendState,
  fromDashboardBackend.selectAlerts
);

export const selectDashboardActivitySummary = createSelector(
  selectDashboardBackendState,
  fromDashboardBackend.selectActivitySummary
);

export const selectDashboardLoadedAttribute = createSelector(
  selectDashboardBackendState,
  fromDashboardBackend.selectLoaded
);

// Market Macro Stat
const selectDashboardMarketMacroStatState = createSelector(
  selectDashboardBackend,
  state => state.dashboardMarketMacroStat
);

export const selectAllDashboardMarketMacroStats = createSelector(
  selectDashboardMarketMacroStatState,
  state => state.entities
);
export const selectDashboardMarketMacroStatsLoaded = createSelector(
  selectDashboardMarketMacroStatState,
  state => state.loaded
);

// RecommendedActions
const selectRecommendedActionsState = createSelector(
  selectDashboardBackend,
  state => state.recommendedActions
);

export const selectAllRecommendedActions = createSelector(
  selectRecommendedActionsState,
  fromRecommendedActions.selectAll
);

export const selectRecommendedActionsLoaded = createSelector(
  selectRecommendedActionsState,
  fromRecommendedActions.selectLoaded
);
