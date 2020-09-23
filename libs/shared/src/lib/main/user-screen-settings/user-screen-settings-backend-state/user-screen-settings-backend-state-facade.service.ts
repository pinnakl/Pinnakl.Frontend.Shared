import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';
import { first } from 'rxjs/operators';

import { UserScreenSetting } from '../user-screen-settings-backend';
import {
  AttemptAddUserScreenSetting,
  AttemptUpdateUserScreenSetting,
  selectAllUserScreenSettings,
  selectUserScreenSettingsLoaded
} from './store';

@Injectable()
export class UserScreenSettingsBackendStateFacade {
  loaded$ = this.store.pipe(select(selectUserScreenSettingsLoaded));
  getUserScreenSetting({
    screen,
    setting
  }: {
    screen: string;
    setting: string;
  }): UserScreenSetting {
    let userScreenSettings: UserScreenSetting[];
    this.store
      .pipe(
        select(selectAllUserScreenSettings),
        first()
      )
      .subscribe(x => (userScreenSettings = x));
    const userScreenSetting = userScreenSettings.find(
      x =>
        x.screen.toLowerCase() === screen.toLowerCase() &&
        x.setting.toLowerCase() === setting.toLowerCase()
    );
    return userScreenSetting;
  }

  post(userScreenSetting: Partial<UserScreenSetting>): void {
    this.store.dispatch(new AttemptAddUserScreenSetting({ userScreenSetting }));
  }

  put(userScreenSetting: Partial<UserScreenSetting>): void {
    this.store.dispatch(
      new AttemptUpdateUserScreenSetting({ userScreenSetting })
    );
  }

  constructor(private store: Store<any>) {}
}
