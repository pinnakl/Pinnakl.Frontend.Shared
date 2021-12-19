import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, tap } from 'rxjs/operators';

import { AumBackendStateFacade } from '@pnkl-frontend/shared';
import { PnlBackendStateFacade } from '../../../pnl-backend-state/pnl-backend-state-facade.service';
import { SetPnlFilter } from './pnl-filters.actions';

@Injectable()
export class PnlFiltersEffects {
  constructor(
    private readonly _actions$: Actions,
    private readonly _aumBackendStateFacade: AumBackendStateFacade,
    private readonly _pnlBackendStateFacade: PnlBackendStateFacade
  ) {}

  load$ = createEffect(() => this._actions$.pipe(
    ofType(SetPnlFilter),
    map(action => action.payload),
    tap(pnlFilters => {
      this._aumBackendStateFacade.loadAum({
        accountId: +pnlFilters.account.id,
        date: pnlFilters.endDate
      });
      this._pnlBackendStateFacade.loadPnlCalculatedAttributes(pnlFilters);
    })
  ), { dispatch: false });
}
