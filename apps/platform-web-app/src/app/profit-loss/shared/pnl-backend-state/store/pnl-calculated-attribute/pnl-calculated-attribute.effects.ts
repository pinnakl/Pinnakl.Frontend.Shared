import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MarksService } from '@pnkl-frontend/core';
import { concatMap, map } from 'rxjs/operators';

import { PnlCalculatedAttributeService } from '../../../pnl-backend/pnl-calculated-attribute/pnl-calculated-attribute.service';
import {
  AttemptLoadPnlCalculatedAttributes,
  LoadPnlCalculatedAttributes,
  LoadPnlCalculatedAttributesFailed
} from './pnl-calculated-attribute.actions';

@Injectable()
export class PnlCalculatedAttributeEffects {
  load$ = createEffect(() => this._actions$.pipe(
    ofType(AttemptLoadPnlCalculatedAttributes),
    map(payload => payload),
    concatMap(async payload => {
      try {
        const [pnlCalculatedAttributes, marks] = await Promise.all([
          this._pnlCalculatedAttributeService.getMany(payload),
          this._marksService.getAllPricesLatestMark()
        ]);
        return LoadPnlCalculatedAttributes({
          pnlCalculatedAttributes: pnlCalculatedAttributes.map(val => ({
            ...val,
            mark: marks.find(m => m.securityId === val.securityId)?.price
          }))
        });
      } catch (error) {
        return LoadPnlCalculatedAttributesFailed({ error });
      }
    })
  ));

  constructor(
    private readonly _actions$: Actions,
    private readonly _marksService: MarksService,
    private readonly _pnlCalculatedAttributeService: PnlCalculatedAttributeService
  ) { }
}
