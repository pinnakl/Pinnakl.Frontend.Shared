import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { PnlCalculatedAttribute } from '../pnl-backend/pnl-calculated-attribute/pnl-calculated-attribute.model';
import { PnlFilter } from '../pnl-backend/pnl-calculated/pnl-calculated-filter.model';
import {
  selectPnlCalculatedAttributes,
  selectPnlCalculatedAttributesLoaded,
  State
} from './store';
import { AttemptLoadPnlCalculatedAttributes } from './store/pnl-calculated-attribute/pnl-calculated-attribute.actions';

@Injectable()
export class PnlBackendStateFacade {
  constructor(private readonly _store: Store<State>) {}

  pnlCalculatedAttributes$: Observable<
    PnlCalculatedAttribute[]
  > = this._store.select(selectPnlCalculatedAttributes);

  pnlCalculatedAttributesLoaded$: Observable<boolean> = this._store.select(
    selectPnlCalculatedAttributesLoaded
  );

  loadPnlCalculatedAttributes(pnlFilter: PnlFilter): void {
    this._store.dispatch(
      AttemptLoadPnlCalculatedAttributes({
        accountId: +pnlFilter.account.id,
        endDate: pnlFilter.endDate,
        startDate: pnlFilter.startDate
      })
    );
  }
}
