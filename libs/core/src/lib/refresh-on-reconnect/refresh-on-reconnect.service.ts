import { Inject, Injectable } from '@angular/core';

import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

import { BackendConnectionFacade } from '@pnkl-frontend/app-state';
import { LOCATION } from '../location.injection-token';

@Injectable()
export class RefreshOnReconnectService {
  private _reconnectionSubscription: Subscription;
  constructor(
    private _backendConnectionFacade: BackendConnectionFacade,
    @Inject(LOCATION) private _location: Location
  ) {}

  disable(): void {
    if (this._reconnectionSubscription) {
      this._reconnectionSubscription.unsubscribe();
    }
  }

  enable(): void {
    this._reconnectionSubscription = this._backendConnectionFacade.reconnectedAt$
      .pipe(skip(1))
      .subscribe(() => {
        this._location.reload();
      });
  }
}
