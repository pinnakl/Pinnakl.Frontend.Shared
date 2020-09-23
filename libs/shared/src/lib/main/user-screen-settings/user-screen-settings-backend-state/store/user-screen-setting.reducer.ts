import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

import { UserScreenSetting } from '../../user-screen-settings-backend';
import {
  UserScreenSettingActions,
  UserScreenSettingActionTypes
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

export function reducer(
  state: State = initialState,
  action: UserScreenSettingActions
): State {
  switch (action.type) {
    case UserScreenSettingActionTypes.AddUserScreenSetting: {
      return adapter.addOne(action.payload.userScreenSetting, state);
    }
    case UserScreenSettingActionTypes.AttemptLoadUserScreenSettings: {
      return {
        ...state,
        loaded: false,
        loading: true
      };
    }
    case UserScreenSettingActionTypes.LoadUserScreenSettings: {
      return adapter.addAll(action.payload.userScreenSettings, {
        ...state,
        loaded: true,
        loading: false
      });
    }
    case UserScreenSettingActionTypes.LoadUserScreenSettingsFailed: {
      return {
        ...state,
        loaded: false,
        loading: false
      };
    }
    case UserScreenSettingActionTypes.UpdateUserScreenSetting: {
      return adapter.updateOne(action.payload.userScreenSetting, state);
    }
    default: {
      return state;
    }
  }
}

export const { selectAll } = adapter.getSelectors();
export const selectLoaded = (state: State) => state.loaded;
