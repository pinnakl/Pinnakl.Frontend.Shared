import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap } from 'rxjs/operators';

import { PositionsPnlDataFieldsService } from '../../positions-pnl-data-fields-backend';
import {
  LoadPositionsPnlDataFields,
  LoadPositionsPnlDataFieldsFailed,
  PositionsPnlDataFieldsActionTypes
} from './positions-pnl-data-fields.actions';

@Injectable()
export class PositionsPnlDataFieldsEffects {
  constructor(
    private readonly _actions$: Actions,
    private readonly _positionsPnlDataFieldsService: PositionsPnlDataFieldsService
  ) { }

  load$ = createEffect(() => this._actions$.pipe(
    ofType(PositionsPnlDataFieldsActionTypes.AttemptLoadPositionsPnlDataFields),
    concatMap(async () => {
      try {
        const positionsPnlDataFields = await this._positionsPnlDataFieldsService.getAll();
        return LoadPositionsPnlDataFields({ positionsPnlDataFields });
      } catch (error) {
        return LoadPositionsPnlDataFieldsFailed({ error });
      }
    })
  ));
}
