import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';

import { UserScreenSetting } from '../../user-screen-settings-backend';
import {
  AddUserScreenSetting,
  AttemptLoadUserScreenSettings,
  LoadUserScreenSettings,
  LoadUserScreenSettingsFailed,
  UpdateUserScreenSetting
} from './user-screen-setting.actions';

export interface State extends EntityState<UserScreenSetting> {
  loaded: boolean;
  loading: boolean;
}

export const adapter: EntityAdapter<UserScreenSetting> = createEntityAdapter<
  UserScreenSetting
>();

export const initialState: State = adapter.getInitialState({
  loaded: false,
  loading: false
});

const featureReducer = createReducer(
  initialState,
  on(AddUserScreenSetting, (state, { userScreenSetting }) => adapter.addOne(userScreenSetting, state)),
  on(AttemptLoadUserScreenSettings, (state) => ({
    ...state,
    loaded: false,
    loading: true
  })),
  on(LoadUserScreenSettings, (state, { userScreenSettings }) => adapter.setAll(userScreenSettings, {
    ...state,
    loaded: true,
    loading: false
  })),
  on(LoadUserScreenSettingsFailed, (state) => ({
    ...state,
    loaded: false,
    loading: false
  })),
  on(UpdateUserScreenSetting, (state, { userScreenSetting }) => adapter.updateOne(userScreenSetting, state))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const { selectAll } = adapter.getSelectors();
export const selectLoaded = (state: State) => state.loaded;
