import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { WebServiceProvider } from '@pnkl-frontend/core';
import { PositionsPnlValueModel } from '@pnkl-frontend/shared';
import { cloneDeep, groupBy } from 'lodash';
import * as moment from 'moment';
import { from, Subscription } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';

import { isMarketOpen } from '../positions-helpers';
import { selectAccountsPnlValuesMap, selectPositionsPnlValues } from './store';
import { AddPnlValue } from './store/positions-pnl-values/positions-pnl-values.actions';

@Injectable()
export class PositionsPnlValuesSavingService {
  private _interval: number;
  private _accountId: number;
  private _lastDateTime: Date;

  constructor(
    private readonly _store: Store,
    private readonly wsp: WebServiceProvider
  ) {
  }

  public set accountId(accountId: number) {
 this._accountId = accountId;
}
  public set lastDateTime(lastDateTime: Date) {
    this._lastDateTime = lastDateTime;
  }

  public startSaving(): void {
    // If there is no start date time value provided then start saving from now
    if (this._lastDateTime == null) {
      this._lastDateTime = new Date();
    }

    // Run interval with checking current minute and if it has been changed then add new pnl value to store
    this._interval = window.setInterval(async () => {
      const currDateTime = new Date();
      if ((isMarketOpen() &&
        this._lastDateTime.getMinutes() !== currDateTime.getMinutes() && (currDateTime.getMinutes() % 5 === 0))
      ) {
        const subs: Subscription = from(this.wsp.getHttp<PositionsPnlValueModel | any>({
          endpoint: 'entities/benchmark_index_intraday_prices',
          params: {
            fields: ['BenchmarkIndex', 'Timestamp', 'Price', 'IntradayReturn'],
            filters: [{ key: 'Timestamp', type: 'GE', value: [moment(currDateTime).format('MM/D/YYYY')] }]
          }
        })).pipe(
          map(values => values.map(value => ({
                id: +value.id,
                plVal: null, // Math.round(+value.price * 100) / 100
                // Round up to 4 digits after decimal
                plPct: +value.intradayreturn,
                date: new Date(`${value.timestamp} Z`),
                accountId: value.benchmarkindex
              })).filter(val => val.date.getMinutes() % 5 === 0)),
          withLatestFrom(
            this._store.pipe(select(selectPositionsPnlValues)),
            this._store.pipe(select(selectAccountsPnlValuesMap))
          )
        ).subscribe(([benchmarks, state, values]: [any, any, any]) => {
          const clonedState = cloneDeep(state);
          const groupebBanchMarks = groupBy(benchmarks, 'accountId');
          const banchKeys = Object.keys(groupebBanchMarks);
          // for now leave it as Account P&L'. Not sure if there are a better way to get this name :(
          banchKeys.unshift('Account P&L');

          for (const [key, value] of Object.entries(banchKeys)) {
            if (clonedState[key].name === 'Account P&L') {
              clonedState[key].data.push({
                accountId: this._accountId,
                plPct: values[this._accountId]?.plPct,
                plVal: values[this._accountId]?.plVal,
                id: Math.round((Math.random() + Math.random() + Math.random()) * 1000000),
                date: new Date()
              });
            } else {
              clonedState[key].data = groupebBanchMarks[value];
            }
          }

          this._store.dispatch(AddPnlValue({ payload: clonedState as PositionsPnlValueModel[] }));
          subs.unsubscribe();
        });
        this._lastDateTime = currDateTime;
      }
    }, 40000); // 60000 == 60s == 1 min
  }

  stopSaving(): void {
    window.clearInterval(this._interval);
  }
}
