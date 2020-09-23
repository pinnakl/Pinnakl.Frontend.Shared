import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import 'hammerjs';

import { AppStateModule } from '@pnkl-frontend/app-state';
import { AuthenticationModule } from '@pnkl-frontend/authentication';
import { CoreModule } from '@pnkl-frontend/core';
import { environment } from '../environments';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HelpModule } from '@pnkl-frontend/help';
import { PushNotificationUiModule } from '@pnkl-frontend/push-notifications-config';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpConfigInterceptor } from './httpconfig.interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [
    AuthenticationModule.register({
      production: environment.production,
      startupScreen: 'dashboard'
    }),
    AppRoutingModule,
    AppStateModule,
    BrowserModule,
    BrowserAnimationsModule,
    HelpModule,
    PushNotificationUiModule,
    CoreModule.register({
      firebaseConfig: environment.firebaseConfig,
      frontEndErrorServiceUrl: environment.frontEndErrorServiceUrl,
      production: environment.production,
      requestTimeoutPeriod: environment.requestTimeoutPeriod
    }),
    ReactiveFormsModule,
    !environment.production ? StoreDevtoolsModule.instrument() : []
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
