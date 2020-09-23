import { Injectable } from '@angular/core';

import { createSelector, select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { selectAllTradeWorkflowSpecs } from './store';

@Injectable()
export class TradeWorkflowSpecsBackendStateFacade {
  realtimePortfolioOn$: Observable<boolean> = this._store.pipe(
    select(_selectRealtimePortfolioOn)
  );

  constructor(private _store: Store<any>) {}
}

const _selectRealtimePortfolioOn = createSelector(
  selectAllTradeWorkflowSpecs,
  specs => {
    const currentSpec = specs[0];
    if (!currentSpec) {
      return false;
    }
    return currentSpec.realTimePortfolio;
  }
);
