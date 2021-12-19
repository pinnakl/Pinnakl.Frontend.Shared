import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap } from 'rxjs/operators';

import { TradeWorkflowSpecService } from '../../../trade-workflow-specs-backend';
import {
  AttemptLoadTradeWorkflowSpecs,
  LoadTradeWorkflowSpecs,
  LoadTradeWorkflowSpecsFailed
} from './trade-workflow-spec.actions';

@Injectable()
export class TradeWorkflowSpecEffects {
  load$ = createEffect(() => this._actions$.pipe(
    ofType(AttemptLoadTradeWorkflowSpecs),
    concatMap(async () => {
      try {
        const tradeWorkflowSpecs = await this._tradeWorkflowSpecService.getAll();
        return LoadTradeWorkflowSpecs({ tradeWorkflowSpecs });
      } catch (error) {
        return LoadTradeWorkflowSpecsFailed({ error });
      }
    })
  ));

  constructor(
    private readonly _actions$: Actions,
    private readonly _tradeWorkflowSpecService: TradeWorkflowSpecService
  ) { }
}
