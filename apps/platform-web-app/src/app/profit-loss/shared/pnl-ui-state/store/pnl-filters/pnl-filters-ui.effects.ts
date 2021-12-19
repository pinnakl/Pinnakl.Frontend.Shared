import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, take, tap } from 'rxjs/operators';

import { PinnaklSpinner } from '@pnkl-frontend/core';

import { Utility } from '@pnkl-frontend/shared';
import {
  LoadPnlCalculatedAttributes,
  LoadPnlCalculatedAttributesFailed,
  PnlCalculatedAttributeActionTypes
} from '../../../pnl-backend-state/store/pnl-calculated-attribute/pnl-calculated-attribute.actions';
import { SetPnlFilterFromUi } from './pnl-filters-ui.actions';
import { SetPnlFilter } from './pnl-filters.actions';

@Injectable()
export class PnlFiltersUiEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly pinnaklSpinner: PinnaklSpinner,
    private readonly utility: Utility
  ) { }

  set$ = createEffect(() => this.actions$.pipe(
    ofType(SetPnlFilterFromUi),
    map((payload) => SetPnlFilter(payload)),
    tap(() => {
      this.pinnaklSpinner.spin();
      this.actions$
        .pipe(
          ofType(LoadPnlCalculatedAttributes, LoadPnlCalculatedAttributesFailed),
          take(1),
          tap(action => {
            if (
              action.type ===
              PnlCalculatedAttributeActionTypes.LoadPnlCalculatedAttributes
            ) {
              this.pinnaklSpinner.stop();
            } else {
              this.utility.showError(action.error);
            }
          }
          )
        )
        .subscribe();
    })
  ));
}
