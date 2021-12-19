import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap } from 'rxjs/operators';

import { UserScreenSettingsService } from '../../../user-screen-settings/user-screen-settings-backend/user-screen-settings.service';
import {
  AddUserScreenSetting,
  AddUserScreenSettingFailed,
  AttemptAddUserScreenSetting,
  AttemptLoadUserScreenSettings,
  AttemptUpdateUserScreenSetting,
  LoadUserScreenSettings,
  LoadUserScreenSettingsFailed,
  UpdateUserScreenSetting,
  UpdateUserScreenSettingFailed
} from './user-screen-setting.actions';

@Injectable()
export class UserScreenSettingEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly userScreenSettingsService: UserScreenSettingsService
  ) { }

  add$ = createEffect(() => this.actions$.pipe(
    ofType(AttemptAddUserScreenSetting),
    concatMap(async (payload) => {
      try {
        const userScreenSetting = await this.userScreenSettingsService.post(
          payload.userScreenSetting
        );
        return AddUserScreenSetting({ userScreenSetting });
      } catch (error) {
        return AddUserScreenSettingFailed({ error });
      }
    })
  ));

  load$ = createEffect(() => this.actions$.pipe(
    ofType(AttemptLoadUserScreenSettings),
    concatMap(async () => {
      try {
        const userScreenSettings = await this.userScreenSettingsService.getAll();
        return LoadUserScreenSettings({ userScreenSettings });
      } catch (error) {
        return LoadUserScreenSettingsFailed({ error });
      }
    })
  ));

  update$ = createEffect(() => this.actions$.pipe(
    ofType(AttemptUpdateUserScreenSetting),
    concatMap(async (payload) => {
      try {
        const userScreenSetting = await this.userScreenSettingsService.put(
          payload.userScreenSetting
        );
        return UpdateUserScreenSetting({
          userScreenSetting: {
            id: userScreenSetting.id,
            changes: userScreenSetting
          }
        });
      } catch (error) {
        return UpdateUserScreenSettingFailed({ error });
      }
    })
  ));
}
