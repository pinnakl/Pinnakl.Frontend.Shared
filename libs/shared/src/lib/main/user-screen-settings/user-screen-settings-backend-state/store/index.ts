import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';

import * as fromUserScreenSetting from './user-screen-setting.reducer';

export * from './user-screen-setting.actions';
export * from './user-screen-setting.effects';
export * from './user-screen-setting-ui.effects';

export interface State {
  userScreenSettings: fromUserScreenSetting.State;
}

export const reducers: ActionReducerMap<State> = {
  userScreenSettings: fromUserScreenSetting.reducer
};

const selectFeature = createFeatureSelector<State>('userScreenSetting');

const selectEntity = createSelector(
  selectFeature,
  state => state.userScreenSettings
);

export const selectAllUserScreenSettings = createSelector(
  selectEntity,
  fromUserScreenSetting.selectAll
);

export const selectUserScreenSettingsLoaded = createSelector(
  selectEntity,
  fromUserScreenSetting.selectLoaded
);
