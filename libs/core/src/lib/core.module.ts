import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  ErrorHandler,
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import { PinnaklModalModule } from '@pnkl-frontend/pinnakl-modal';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { ToastrModule } from 'ngx-toastr';

import { AG_GRID_KEY, AG_GRID_KEY_TOKEN } from "./ag-grid.token";
import { AuthenticationService } from './authentication.service';
import { ConfirmActionComponent, ConfirmActionService } from './confirm-action';
import { CustomErrorHandler } from './custom-error-handler';
import {
  FIREBASE_CONFIG,
  FRONT_END_ERROR_SERVICE_URL,
  HTTP_SERVER_URL,
  PRODUCTION,
  REQUEST_TIMEOUT_PERIOD
} from './environment.tokens';
import { EventSourceService, PageSubscriptionsHandler, SubscriptionsManager } from './event-source';
import { FrontendErrorService } from './frontend-error';
import { Initializer } from './initializer.service';
import { LOCATION } from './location.injection-token';
import { MarksService } from './marks.service';
import { throwIfAlreadyLoaded } from './module-import-guard';
import { OnDemandPreloadService } from './on-demand-preload.service';
import { PinnaklHttpService } from './pinnakl-http.service';
import { PinnaklWebSocketService } from './pinnakl-web-socket.service';
import { PinnaklSpinner, PinnaklSpinnerComponent } from './pnkl-spinner';
import { PushNotificationModule } from './push-notifications';
import { ReconnectWindow, ReconnectWindowComponent } from './reconnect-window';
import { RefreshOnReconnectService } from './refresh-on-reconnect';
import { OnDemandPreloadStrategy } from './selective-preloading-strategy.service';
import { ServerSentEventsStreamService } from './server-sent-events-stream.service';
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
    PinnaklHttpService,
    ReconnectWindow,
    RefreshOnReconnectService,
    Toastr,
    UserService,
    WebServiceProvider,
    WebServiceUtility,
    MarksService,
    ServerSentEventsStreamService,
    SubscriptionsManager,
    PageSubscriptionsHandler,
    {
      provide: LOCATION,
      useValue: location
    },
    {
      provide: ErrorHandler,
      useClass: CustomErrorHandler
    },
    {
      provide: AG_GRID_KEY_TOKEN,
      useValue: AG_GRID_KEY
    }
  ]
})
export class CoreModule {
  public static register(config: Record<string, any>): ModuleWithProviders<CoreModule> {
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
        {
          provide: HTTP_SERVER_URL,
          useValue: config.httpServerUrl
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
