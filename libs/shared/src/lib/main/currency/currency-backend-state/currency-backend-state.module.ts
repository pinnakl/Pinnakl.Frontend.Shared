import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../../../shared.module';
import { AllCurrenciesLoadedGuard } from './guards';
import * as fromCurrencyBackend from './store';
import { CurrencyEffects } from './store/currency';

@NgModule({
  imports: [
    EffectsModule.forFeature([CurrencyEffects]),
    SharedModule,
    StoreModule.forFeature('currencyBackend', fromCurrencyBackend.reducers)
  ],
  providers: [AllCurrenciesLoadedGuard]
})
export class CurrencyBackendStateModule {}
