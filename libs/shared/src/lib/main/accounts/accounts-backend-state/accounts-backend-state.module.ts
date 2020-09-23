import { NgModule } from '@angular/core';

import { StoreModule } from '@ngrx/store';

import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from '../../../shared.module';
import { AccountsBackendStateFacade } from './accounts-backend-state-facade.service';
import { AllAccountsLoadedGuard } from './guards';
import * as fromAccountsBackend from './store';
import { AccountEffects } from './store/account';
import { CashBalanceEffects } from './store/cash-balance';

@NgModule({
  imports: [
    EffectsModule.forFeature([AccountEffects, CashBalanceEffects]),
    SharedModule,
    StoreModule.forFeature('accountsBackend', fromAccountsBackend.reducers)
  ],
  providers: [AccountsBackendStateFacade, AllAccountsLoadedGuard]
})
export class AccountsBackendStateModule {}
