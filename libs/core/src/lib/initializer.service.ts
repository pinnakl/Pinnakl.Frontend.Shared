import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { LicenseManager } from 'ag-grid-enterprise';

import { BackendConnectionFacade } from '@pnkl-frontend/app-state';
import { AuthenticationService } from './authentication.service';
import { PinnaklWebSocketService } from './pinnakl-web-socket.service';
import { PinnaklSpinner } from './pnkl-spinner';
import { PushNotificationService } from './push-notifications';
import { ReconnectWindow } from './reconnect-window';
import { UserService } from './user.service';
import { WebServiceProvider } from './web-service-provider.service';

@Injectable()
export class Initializer {
  private readonly AG_GRID_KEY =
    'Waterstone_Capital_OMS_1Devs8_July_2020__MTU5NDE2MjgwMDAwMA==bca346b4f6381b196dd15f00c8047f0f';

  constructor(
    private authenticationService: AuthenticationService,
    private _backendConnectionFacade: BackendConnectionFacade,
    private pinnaklSpinner: PinnaklSpinner,
    private pinnaklWebSocketSvc: PinnaklWebSocketService,
    private pushNotificationService: PushNotificationService,
    private reconnectWindow: ReconnectWindow,
    private router: Router,
    private userService: UserService,
    private webServiceProvider: WebServiceProvider
  ) {}

  initialize(): void {
    console.log('Initializer called');
    this.connectToServer();
    this.setupExternalComponents();
    this.pushNotificationService.loadWebNotificationSettings();
  }

  private connectToServer(): void {
    this.pinnaklWebSocketSvc.enableReconnect();
    this.pinnaklWebSocketSvc.setOnClose(() => {
      this.pinnaklSpinner.stop();
      this.reconnectWindow.show();
    });
    this.pinnaklWebSocketSvc.setOnReconnect(() => {
      this._backendConnectionFacade.setReconnectedAt(new Date());
      this.reconnectWindow.hide();
    });
    this.webServiceProvider.unauthorizedRequestHandler = async () => {
      this.pinnaklSpinner.stop();
      this.authenticationService.logout();
      await this.router.navigate(['/login']);
      location.reload();
    };
  }

  private setupExternalComponents(): void {
    // AG GRID
    LicenseManager.setLicenseKey(this.AG_GRID_KEY);
  }
}
