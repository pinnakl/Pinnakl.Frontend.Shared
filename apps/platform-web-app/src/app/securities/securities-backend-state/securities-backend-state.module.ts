import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '@pnkl-frontend/shared';
import { AllSecuritiesLoadedGuard } from './guards';
import { reducers } from './store';
import { SecurityEffects } from './store/security';

@NgModule({
  imports: [
    EffectsModule.forFeature([SecurityEffects]),
    SharedModule,
    StoreModule.forFeature('securitiesBackend', reducers)
  ],
  providers: [AllSecuritiesLoadedGuard]
})
export class SecuritiesBackendStateModule {}
