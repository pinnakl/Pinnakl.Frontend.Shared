import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { concatMap, filter, first } from 'rxjs/operators';

import { Utility } from '@pnkl-frontend/shared';
import { selectPnlCalculatedAttributesLoaded } from '../../pnl-backend-state/store';
import { selectPnlFilterValue, SetPnlFilter } from '../store';

@Injectable()
export class PnlRealtimeFilterSetGuard implements CanActivate {
  canActivate(): Observable<boolean> {
    return this.filterSet();
  }

  private filterSet(): Observable<boolean> {
    return this.store.pipe(
      select(selectPnlFilterValue),
      filter(value => !!value),
      first(),
      concatMap(filterValue => {
        const { endDate, startDate } = filterValue;
        const lastBusinessDay = this.utility.getPreviousBusinessDay();
        if (
          this.utility.compareDates(startDate, lastBusinessDay) &&
          this.utility.compareDates(endDate, lastBusinessDay)
        ) {
          return [true];
        }
        this.store.dispatch(
          SetPnlFilter({ payload: { ...filterValue, endDate: lastBusinessDay, startDate: lastBusinessDay } })
        );
        return this.store.pipe(
          select(selectPnlCalculatedAttributesLoaded),
          filter(loaded => !loaded),
          first()
        );
      }),
      concatMap(() =>
        this.store.pipe(
          select(selectPnlCalculatedAttributesLoaded),
          filter(loaded => loaded),
          first()
        )
      )
    );
  }

  constructor(private readonly store: Store<any>, private readonly utility: Utility) { }
}
