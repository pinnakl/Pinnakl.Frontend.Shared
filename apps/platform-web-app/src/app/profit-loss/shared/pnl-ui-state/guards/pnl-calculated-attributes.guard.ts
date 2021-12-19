import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { PnlBackendStateFacade } from '../../pnl-backend-state/pnl-backend-state-facade.service';

// Can only be used alongside PnlFilterSetGuard
@Injectable()
export class PnlCalculatedAttributesGuard implements CanActivate {
  constructor(private readonly _pnlBackendStateFacade: PnlBackendStateFacade) {}

  canActivate(): Observable<boolean> {
    return this._pnlCalculatedAttributesLoaded();
  }

  private _pnlCalculatedAttributesLoaded(): Observable<boolean> {
    return this._pnlBackendStateFacade.pnlCalculatedAttributesLoaded$.pipe(
      filter(loaded => loaded),
      take(1)
    );
  }
}
