import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { TradeWorkflowSpecService } from '../../../trade-workflow-specs-backend';
import {
  AttemptLoadTradeWorkflowSpecs,
  LoadTradeWorkflowSpecs,
  LoadTradeWorkflowSpecsFailed,
  TradeWorkflowSpecActionTypes
} from './trade-workflow-spec.actions';

@Injectable()
export class TradeWorkflowSpecEffects {
  @Effect()
  load$: Observable<
    LoadTradeWorkflowSpecs | LoadTradeWorkflowSpecsFailed
  > = this._actions$.pipe(
    ofType<AttemptLoadTradeWorkflowSpecs>(
      TradeWorkflowSpecActionTypes.AttemptLoadTradeWorkflowSpecs
    ),
    concatMap(async () => {
      try {
        const tradeWorkflowSpecs = await this._tradeWorkflowSpecService.getAll();
        return new LoadTradeWorkflowSpecs({ tradeWorkflowSpecs });
      } catch (error) {
        return new LoadTradeWorkflowSpecsFailed({ error });
      }
    })
  );

  constructor(
    private _actions$: Actions,
    private _tradeWorkflowSpecService: TradeWorkflowSpecService
  ) {}
}
