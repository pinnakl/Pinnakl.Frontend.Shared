import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { concatMap } from 'rxjs/operators';

import { UserScreenSettingsService } from '../../user-screen-settings-backend';
import {
  AddUserScreenSetting,
  AddUserScreenSettingFailed,
  AttemptAddUserScreenSetting,
  AttemptLoadUserScreenSettings,
  AttemptUpdateUserScreenSetting,
  LoadUserScreenSettings,
  LoadUserScreenSettingsFailed,
  UpdateUserScreenSetting,
  UpdateUserScreenSettingFailed,
  UserScreenSettingActionTypes
} from './user-screen-setting.actions';

@Injectable()
export class UserScreenSettingEffects {
  constructor(
    private actions$: Actions,
    private userScreenSettingsService: UserScreenSettingsService
  ) {}

  @Effect()
  add$ = this.actions$.pipe(
    ofType<AttemptAddUserScreenSetting>(
      UserScreenSettingActionTypes.AttemptAddUserScreenSettings
    ),
    concatMap(async ({ payload }) => {
      try {
        const userScreenSetting = await this.userScreenSettingsService.post(
          payload.userScreenSetting
        );
        return new AddUserScreenSetting({ userScreenSetting });
      } catch (error) {
        return new AddUserScreenSettingFailed({ error });
      }
    })
  );

  @Effect()
  load$ = this.actions$.pipe(
    ofType<AttemptLoadUserScreenSettings>(
      UserScreenSettingActionTypes.AttemptLoadUserScreenSettings
    ),
    concatMap(async () => {
      try {
        const userScreenSettings = await this.userScreenSettingsService.getAll();
        return new LoadUserScreenSettings({ userScreenSettings });
      } catch (error) {
        return new LoadUserScreenSettingsFailed({ error });
      }
    })
  );

  @Effect()
  update$ = this.actions$.pipe(
    ofType<AttemptUpdateUserScreenSetting>(
      UserScreenSettingActionTypes.AttemptUpdateUserScreenSettings
    ),
    concatMap(async ({ payload }) => {
      try {
        const userScreenSetting = await this.userScreenSettingsService.put(
          payload.userScreenSetting
        );
        return new UpdateUserScreenSetting({
          userScreenSetting: {
            id: userScreenSetting.id,
            changes: userScreenSetting
          }
        });
      } catch (error) {
        return new UpdateUserScreenSettingFailed({ error });
      }
    })
  );
}
