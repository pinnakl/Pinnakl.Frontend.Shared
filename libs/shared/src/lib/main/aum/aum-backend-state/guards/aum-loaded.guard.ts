import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { Observable } from 'rxjs';

import { filter, map, take } from 'rxjs/operators';
import { AumBackendStateFacade } from '../aum-backend-state-facade.service';

@Injectable()
export class AumLoadedGuard implements CanActivate {
  constructor(private readonly _aumBackendStateFacade: AumBackendStateFacade) {}

  canActivate(): Observable<boolean> {
    return this._aumLoaded();
  }

  private _aumLoaded(): Observable<boolean> {
    return this._aumBackendStateFacade.aumValue$.pipe(
      map(aum => !!aum),
      filter(loaded => loaded),
      take(1)
    );
  }
}
