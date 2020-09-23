import { NgModule, Inject, ModuleWithProviders } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';
import {
  RouterStateSerializer,
  StoreRouterConnectingModule
} from '@ngrx/router-store';
import { ActionReducerMap, MetaReducer, StoreModule } from '@ngrx/store';

import * as fromBackendConnection from './backend-connection';
import { clearStore } from './clear-store';
import * as fromRouterState from './router';

export interface State {
  backendConnection: fromBackendConnection.State;
  router: fromRouterState.RouterState;
}

export const metaReducers: MetaReducer<State>[] = [clearStore];

export const reducers: ActionReducerMap<State> = {
  backendConnection: fromBackendConnection.reducer,
  router: fromRouterState.reducer
};

@NgModule({
  imports: [
    EffectsModule.forRoot([]),
    StoreModule.forRoot(reducers, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true
      }
    }),
    StoreRouterConnectingModule.forRoot({ stateKey: 'router' })
  ],
  providers: [
    fromBackendConnection.BackendConnectionFacade,
    {
      provide: RouterStateSerializer,
      useClass: fromRouterState.CustomRouterStateSerializer
    }
  ]
})
export class AppStateModule {}
