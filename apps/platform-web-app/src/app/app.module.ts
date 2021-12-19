import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MsalBroadcastService,
  MsalGuard,
  MsalModule,
  MsalService,
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG
} from '@azure/msal-angular';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AppStateModule } from '@pnkl-frontend/app-state';
import {
  AuthenticationModule, MSALGuardConfigFactory,
  MSALInstanceFactory,
  MSALInterceptorConfigFactory, UserTypes
} from '@pnkl-frontend/authentication';
import { CoreModule } from '@pnkl-frontend/core';
import { HelpModule } from '@pnkl-frontend/help';
import { PushNotificationUiModule } from '@pnkl-frontend/push-notifications-config';
import { HttpConfigInterceptor, SharedModule } from '@pnkl-frontend/shared';

import 'hammerjs';

import { environment } from '../environments';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PositionModule } from './positions/positions-ui/positions.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    AuthenticationModule.register({
      production: environment.production,
      startupScreen: { prod: 'dashboard', dev: 'reporting/all-reports' },
      userType: UserTypes.INTERNAL
    }),
    AppRoutingModule,
    AppStateModule,
    BrowserModule,
    BrowserAnimationsModule,
    HelpModule,
    PushNotificationUiModule,
    CoreModule.register({
      httpServerUrl: environment.httpServerUrl,
      firebaseConfig: environment.firebaseConfig,
      frontEndErrorServiceUrl: environment.frontEndErrorServiceUrl,
      production: environment.production,
      requestTimeoutPeriod: environment.requestTimeoutPeriod
    }),
    SharedModule.register(environment.fileServiceUrl, environment.httpServiceUrl),
    SharedModule,
    ReactiveFormsModule,
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    MsalModule,
    PositionModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpConfigInterceptor,
      multi: true
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
