import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { AccountingService } from '../../../pinnakl-web-services/accounting.service';
import { AumBackendStateFacade } from './aum-backend-state-facade.service';
import { AumLoadedGuard } from './guards';
import * as fromAumBackend from './store';

@NgModule({
  imports: [
    CommonModule,
    EffectsModule.forFeature([fromAumBackend.AumEffects]),
    StoreModule.forFeature('aumBackend', fromAumBackend.reducers)
  ],
  providers: [AccountingService, AumBackendStateFacade, AumLoadedGuard]
})
export class AumBackendStateModule {}
