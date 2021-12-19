import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';

import { PositionsBackendStateFacade } from '../positions-backend-state-facade.service';

@Injectable()
export class SecurityCustomAttributesLoadedGuard implements CanActivate {
  constructor(private readonly _positionsBackendStateFacade: PositionsBackendStateFacade) { }

  canActivate(): Observable<boolean> {
    return this._securityCustomAttributesLoaded();
  }

  private _securityCustomAttributesLoaded(): Observable<boolean> {
    return this._positionsBackendStateFacade.securityCustomAttributesLoaded$.pipe(
      tap(loaded => {
        if (loaded) {
          return;
        }
        this._positionsBackendStateFacade.loadSecurityCustomAttributes();
      }),
      filter(loaded => loaded),
      take(1)
    );
  }
}
