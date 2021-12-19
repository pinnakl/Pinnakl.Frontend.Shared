import { Update } from '@ngrx/entity';
import { createAction, props } from '@ngrx/store';

import { UserScreenSetting } from '../../user-screen-settings-backend';

export enum UserScreenSettingActionTypes {
  AddUserScreenSetting = '[UserScreenSetting] Add UserScreenSetting',
  AddUserScreenSettingFailed = '[UserScreenSetting] Add UserScreenSetting Failed',
  AttemptAddUserScreenSettings = '[UserScreenSetting] Attempt Add UserScreenSetting',
  AttemptLoadUserScreenSettings = '[UserScreenSetting] Attempt Load UserScreenSettings',
  AttemptUpdateUserScreenSettings = '[UserScreenSetting] Attempt Update UserScreenSetting',
  LoadUserScreenSettings = '[UserScreenSetting] Load UserScreenSettings',
  LoadUserScreenSettingsFailed = '[UserScreenSetting] Load UserScreenSettings Failed',
  UpdateUserScreenSetting = '[UserScreenSetting] Update UserScreenSetting',
  UpdateUserScreenSettingFailed = '[UserScreenSetting] Update UserScreenSetting Failed'
}

export const AddUserScreenSetting = createAction(
  UserScreenSettingActionTypes.AddUserScreenSetting,
  props<{ userScreenSetting: UserScreenSetting }>()
);

export const AddUserScreenSettingFailed = createAction(
  UserScreenSettingActionTypes.AddUserScreenSettingFailed,
  props<{ error: any }>()
);

export const AttemptAddUserScreenSetting = createAction(
  UserScreenSettingActionTypes.AttemptAddUserScreenSettings,
  props<{ userScreenSetting: Partial<UserScreenSetting> }>()
);

export const AttemptLoadUserScreenSettings = createAction(
  UserScreenSettingActionTypes.AttemptLoadUserScreenSettings
);

export const AttemptUpdateUserScreenSetting = createAction(
  UserScreenSettingActionTypes.AttemptUpdateUserScreenSettings,
  props<{ userScreenSetting: Partial<UserScreenSetting> }>()
);

export const LoadUserScreenSettings = createAction(
  UserScreenSettingActionTypes.LoadUserScreenSettings,
  props<{ userScreenSettings: UserScreenSetting[] }>()
);

export const LoadUserScreenSettingsFailed = createAction(
  UserScreenSettingActionTypes.LoadUserScreenSettingsFailed,
  props<{ error: any }>()
);

export const UpdateUserScreenSetting = createAction(
  UserScreenSettingActionTypes.UpdateUserScreenSetting,
  props<{ userScreenSetting: Update<UserScreenSetting> }>()
);

export const UpdateUserScreenSettingFailed = createAction(
  UserScreenSettingActionTypes.UpdateUserScreenSettingFailed,
  props<{ error: any }>()
);
