import { Inject, Injectable } from '@angular/core';

import { LicenseManager } from 'ag-grid-enterprise';

import { AuthenticationService } from './authentication.service';
import { PinnaklSpinner } from './pnkl-spinner';
import { WebServiceProvider } from './web-service-provider.service';
import { AG_GRID_KEY_TOKEN } from './ag-grid.token';

@Injectable()
export class Initializer {

  constructor(
    @Inject(AG_GRID_KEY_TOKEN) private readonly agGridKey: string,
    private readonly authenticationService: AuthenticationService,
    private readonly pinnaklSpinner: PinnaklSpinner,
    private readonly webServiceProvider: WebServiceProvider
  ) { }

  initialize(): void {
    console.log('Initializer called');
    this.connectToServer();
    this.setupExternalComponents();
    // DO NOT REMOVE
    // this.pushNotificationService.loadWebNotificationSettings();
  }

  private connectToServer(): void {
    // this.pinnaklWebSocketSvc.enableReconnect();
    // this.pinnaklWebSocketSvc.setOnClose(() => {
    //   this.pinnaklSpinner.stop();
    //   this.reconnectWindow.show();
    // });
    // this.pinnaklWebSocketSvc.setOnReconnect(() => {
    //   this._backendConnectionFacade.setReconnectedAt(new Date());
    //   this.reconnectWindow.hide();
    // });
    this.webServiceProvider.unauthorizedRequestHandler = async () => {
      this.pinnaklSpinner.stop();
      await this.authenticationService.logout();
      location.reload();
    };
  }

  private setupExternalComponents(): void {
    LicenseManager.setLicenseKey(this.agGridKey);
  }
}
