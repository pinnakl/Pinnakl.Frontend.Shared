import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';

import { PositionsBackendStateFacade } from '../positions-backend-state-facade.service';

@Injectable()
export class IdcColumnsLoadedGuard implements CanActivate {
  constructor(private readonly _positionsBackendStateFacade: PositionsBackendStateFacade) { }

  canActivate(): Observable<boolean> {
    return this._idcColumnsLoaded();
  }

  private _idcColumnsLoaded(): Observable<boolean> {
    return this._positionsBackendStateFacade.IdcColumnsLoaded$.pipe(
      tap(loaded => {
        if (loaded) {
          return;
        }
        this._positionsBackendStateFacade.loadIdcColumns();
      }),
      filter(loaded => loaded),
      take(1)
    );
  }
}
