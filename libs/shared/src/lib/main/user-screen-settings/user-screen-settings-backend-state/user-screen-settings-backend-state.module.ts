import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { UserScreenSettingsBackendModule } from '../user-screen-settings-backend';
import { UserScreenSettingsLoadedGuard } from './guards';
import {
  reducers,
  UserScreenSettingEffects,
  UserScreenSettingUiEffects
} from './store';
import { UserScreenSettingsBackendStateFacade } from './user-screen-settings-backend-state-facade.service';

@NgModule({
  imports: [
    EffectsModule.forFeature([
      UserScreenSettingEffects,
      UserScreenSettingUiEffects
    ]),
    StoreModule.forFeature('userScreenSetting', reducers),
    UserScreenSettingsBackendModule
  ],
  providers: [
    UserScreenSettingsBackendStateFacade,
    UserScreenSettingsLoadedGuard
  ]
})
export class UserScreenSettingsBackendStateModule {}
