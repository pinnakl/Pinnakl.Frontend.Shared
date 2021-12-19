import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { PositionsPnlValueModel } from '@pnkl-frontend/shared';
import { map } from 'rxjs/operators';
import { PositionsPnlValuesSavingService } from '../../positions-pnl-values-saving.service';

import { InitializePnlValues } from './positions-pnl-values.actions';

@Injectable()
export class PositionsPnlValuesEffects {
  startSaving$ = createEffect(() => this._actions.pipe(
    ofType(InitializePnlValues),
    map(({ payload: values, accountId }) => {
      if (values.length) {
        this._pnlValuesSaving.accountId = accountId;
        this._pnlValuesSaving.lastDateTime = this.getLatestDate(values);
        this._pnlValuesSaving.startSaving();
      } else {
        this._pnlValuesSaving.accountId = accountId;
        this._pnlValuesSaving.startSaving();
      }
    })
  ), { dispatch: false });

  constructor(
    private readonly _actions: Actions,
    private readonly _pnlValuesSaving: PositionsPnlValuesSavingService
  ) { }

  private getLatestDate(values: PositionsPnlValueModel[]): Date {
    let maxDate: Date;
    for (const { date } of values) {
      if (maxDate) {
        if (maxDate < date) {
          maxDate = date;
        }
      } else {
        maxDate = date;
      }
    }
    return maxDate;
  }
}
