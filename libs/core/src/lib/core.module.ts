import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  ErrorHandler,
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';

import { DialogModule } from '@progress/kendo-angular-dialog';
import { ToastrModule } from 'ngx-toastr';

import { PinnaklModalModule } from '@pnkl-frontend/pinnakl-modal';
import { AuthenticationService } from './authentication.service';
import { ConfirmActionComponent, ConfirmActionService } from './confirm-action';
import { CustomErrorHandler } from './custom-error-handler';
import {
  FIREBASE_CONFIG,
  FRONT_END_ERROR_SERVICE_URL,
  PRODUCTION,
  REQUEST_TIMEOUT_PERIOD
} from './environment.tokens';
import { EventSourceService } from './event-source';
import { FrontendErrorService } from './frontend-error';
import { Initializer } from './initializer.service';
import { LOCATION } from './location.injection-token';
import { throwIfAlreadyLoaded } from './module-import-guard';
import { OnDemandPreloadService } from './on-demand-preload.service';
import { PinnaklWebSocketService } from './pinnakl-web-socket.service';
import { PinnaklSpinner, PinnaklSpinnerComponent } from './pnkl-spinner';
import { PushNotificationModule } from './push-notifications';
import { ReconnectWindow, ReconnectWindowComponent } from './reconnect-window';
import { RefreshOnReconnectService } from './refresh-on-reconnect';
import { OnDemandPreloadStrategy } from './selective-preloading-strategy.service';
import { Toastr } from './toastr.service';
import { UserService } from './user.service';
import { WebServiceProvider } from './web-service-provider.service';
import { WebServiceUtility } from './web-service-utility.service';

@NgModule({
  imports: [
    CommonModule,
    DialogModule,
    HttpClientModule,
    PinnaklModalModule,
    PushNotificationModule,
    ToastrModule.forRoot()
  ],
  declarations: [
    ConfirmActionComponent,
    PinnaklSpinnerComponent,
    ReconnectWindowComponent
  ],
  exports: [
    ConfirmActionComponent,
    PinnaklSpinnerComponent,
    ReconnectWindowComponent
  ],
  providers: [
    AuthenticationService,
    ConfirmActionService,
    EventSourceService,
    FrontendErrorService,
    Initializer,
    OnDemandPreloadStrategy,
    OnDemandPreloadService,
    PinnaklSpinner,
    PinnaklWebSocketService,
    ReconnectWindow,
    RefreshOnReconnectService,
    Toastr,
    UserService,
    WebServiceProvider,
    WebServiceUtility,
    {
      provide: LOCATION,
      useValue: location
    },
    {
      provide: ErrorHandler,
      useClass: CustomErrorHandler
    }
  ]
})
export class CoreModule {
  public static register(config): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        {
          provide: FIREBASE_CONFIG,
          useValue: config.firebaseConfig
        },
        {
          provide: FRONT_END_ERROR_SERVICE_URL,
          useValue: config.frontEndErrorServiceUrl
        },
        { provide: PRODUCTION, useValue: config.production },
        {
          provide: REQUEST_TIMEOUT_PERIOD,
          useValue: config.requestTimeoutPeriod
        }
      ]
    };
  }

  constructor(
    @Optional()
    @SkipSelf()
    parentModule: CoreModule
  ) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
