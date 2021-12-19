import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap } from 'rxjs/operators';

import { SecurityService } from '@pnkl-frontend/shared';
import {
  AttemptLoadSecurities,
  LoadSecurities,
  LoadSecuritiesFailed
} from './security.actions';

@Injectable()
export class SecurityEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(AttemptLoadSecurities),
    concatMap(() =>
      this.securityService
        .getAllSecurities()
        .then(securities => LoadSecurities({ securities }))
        .catch(error => LoadSecuritiesFailed({ error }))
    )
  ));

  constructor(
    private readonly actions$: Actions,
    private readonly securityService: SecurityService
  ) { }
}
