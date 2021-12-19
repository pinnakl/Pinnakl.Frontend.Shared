import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';

import { PositionsBackendStateFacade } from '../positions-backend-state-facade.service';

@Injectable()
export class PositionsReportInfoLoadedGuard implements CanActivate {
  constructor(private readonly _positionsBackendStateFacade: PositionsBackendStateFacade) { }

  canActivate(): Observable<boolean> {
    return this._positionsReportInfoLoaded();
  }

  private _positionsReportInfoLoaded(): Observable<boolean> {
    return this._positionsBackendStateFacade.positionsReportInfoLoaded$.pipe(
      tap(loaded => {
        if (loaded) {
          return;
        }
        this._positionsBackendStateFacade.loadPositionsReportInfo();
      }),
      filter(loaded => loaded),
      take(1)
    );
  }
}
