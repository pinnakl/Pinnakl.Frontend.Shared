import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { PositionsPnlDataFieldsService } from '../../positions-pnl-data-fields-backend';
import {
  AttemptLoadPositionsPnlDataFields,
  LoadPositionsPnlDataFields,
  LoadPositionsPnlDataFieldsFailed,
  PositionsPnlDataFieldsActionTypes
} from './positions-pnl-data-fields.actions';

@Injectable()
export class PositionsPnlDataFieldsEffects {
  constructor(
    private _actions$: Actions,
    private _positionsPnlDataFieldsService: PositionsPnlDataFieldsService
  ) {}

  @Effect()
  load$: Observable<
    LoadPositionsPnlDataFields | LoadPositionsPnlDataFieldsFailed
  > = this._actions$.pipe(
    ofType<AttemptLoadPositionsPnlDataFields>(
      PositionsPnlDataFieldsActionTypes.AttemptLoadPositionsPnlDataFields
    ),
    concatMap(async () => {
      try {
        const positionsPnlDataFields = await this._positionsPnlDataFieldsService.getAll();
        return new LoadPositionsPnlDataFields({ positionsPnlDataFields });
      } catch (error) {
        return new LoadPositionsPnlDataFieldsFailed({ error });
      }
    })
  );
}
