import { Update } from '@ngrx/entity';
import { Action } from '@ngrx/store';

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

export class AddUserScreenSetting implements Action {
  readonly type = UserScreenSettingActionTypes.AddUserScreenSetting;

  constructor(public payload: { userScreenSetting: UserScreenSetting }) {}
}

export class AddUserScreenSettingFailed implements Action {
  readonly type = UserScreenSettingActionTypes.AddUserScreenSettingFailed;

  constructor(public payload: { error: any }) {}
}

export class AttemptAddUserScreenSetting implements Action {
  readonly type = UserScreenSettingActionTypes.AttemptAddUserScreenSettings;

  constructor(
    public payload: { userScreenSetting: Partial<UserScreenSetting> }
  ) {}
}

export class AttemptLoadUserScreenSettings implements Action {
  readonly type = UserScreenSettingActionTypes.AttemptLoadUserScreenSettings;
}

export class AttemptUpdateUserScreenSetting implements Action {
  readonly type = UserScreenSettingActionTypes.AttemptUpdateUserScreenSettings;

  constructor(
    public payload: { userScreenSetting: Partial<UserScreenSetting> }
  ) {}
}

export class LoadUserScreenSettings implements Action {
  readonly type = UserScreenSettingActionTypes.LoadUserScreenSettings;

  constructor(public payload: { userScreenSettings: UserScreenSetting[] }) {}
}

export class LoadUserScreenSettingsFailed implements Action {
  readonly type = UserScreenSettingActionTypes.LoadUserScreenSettingsFailed;

  constructor(public payload: { error: any }) {}
}

export class UpdateUserScreenSetting implements Action {
  readonly type = UserScreenSettingActionTypes.UpdateUserScreenSetting;

  constructor(
    public payload: { userScreenSetting: Update<UserScreenSetting> }
  ) {}
}

export class UpdateUserScreenSettingFailed implements Action {
  readonly type = UserScreenSettingActionTypes.UpdateUserScreenSettingFailed;

  constructor(public payload: { error: any }) {}
}

export type UserScreenSettingActions =
  | AddUserScreenSetting
  | AddUserScreenSettingFailed
  | AttemptAddUserScreenSetting
  | AttemptLoadUserScreenSettings
  | AttemptUpdateUserScreenSetting
  | LoadUserScreenSettings
  | LoadUserScreenSettingsFailed
  | UpdateUserScreenSetting
  | UpdateUserScreenSettingFailed;
