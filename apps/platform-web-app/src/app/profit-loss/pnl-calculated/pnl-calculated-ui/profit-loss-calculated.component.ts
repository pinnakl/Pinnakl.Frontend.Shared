import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { select, Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PinnaklColDef } from '@pnkl-frontend/shared';
import { selectAllAccounts } from '@pnkl-frontend/shared';
import { Account } from '@pnkl-frontend/shared';
import { AssetType } from '@pnkl-frontend/shared';
import { PnlBackendStateFacade } from '../../shared/pnl-backend-state/pnl-backend-state-facade.service';
import { PnlCalculatedAttribute } from '../../shared/pnl-backend/pnl-calculated-attribute/pnl-calculated-attribute.model';
import { PnlFilter } from '../../shared/pnl-backend/pnl-calculated/pnl-calculated-filter.model';
import { PnlUiStateFacadeService } from '../../shared/pnl-ui-state/pnl-ui-state-facade.service';
import { selectPnlFilterVisible } from '../../shared/pnl-ui-state/store';
import { HideFilter } from '../../shared/pnl-ui-state/store/pnl-filters';

@Component({
  selector: 'profit-loss-calculated',
  templateUrl: './profit-loss-calculated.component.html',
  styleUrls: ['profit-loss-calculated.component.scss'],
  providers: [DatePipe, DecimalPipe]
})
export class ProfitLossCalculatedComponent implements OnDestroy, OnInit {
  assetTypes: Array<AssetType>;
  filterActive = false;

  accounts$: Observable<Account[]>;
  aggregation$: Observable<PinnaklColDef[]>;
  pnlFilterValue$: Observable<PnlFilter>;
  filterVisible$: Observable<boolean>;
  pnl$: Observable<PnlCalculatedAttribute[]>;
  pnlCalculatedColumns$: Observable<PinnaklColDef[]>;

  constructor(
    private decimalPipe: DecimalPipe,
    private _pnlBackendStateFacade: PnlBackendStateFacade,
    public _pnlUiStateFacade: PnlUiStateFacadeService,
    private store: Store<any>
  ) {}

  addColumn(column: string): void {
    this._pnlUiStateFacade.addPnlCalculatedColumn(column);
  }

  applyFilter(filterData: PnlFilter): void {
    this._pnlUiStateFacade.setPnlFilter(filterData);
    this.hideFilter();
  }

  hideFilter(): void {
    this.store.dispatch(HideFilter());
  }

  ngOnDestroy(): void {
    this.store.dispatch(HideFilter());
  }

  ngOnInit(): void {
    this.accounts$ = this.store.pipe(select(selectAllAccounts));
    this.pnlCalculatedColumns$ = this._pnlUiStateFacade.pnlCalculatedColumns$;
    this.pnlFilterValue$ = this._pnlUiStateFacade.pnlFilterValue$;
    this.filterVisible$ = this.store.pipe(select(selectPnlFilterVisible));
    this.pnl$ = this._pnlBackendStateFacade.pnlCalculatedAttributes$;
    this.setAggregation();
  }

  removeColumn(column: string): void {
    this._pnlUiStateFacade.removePnlCalculatedColumn(column);
  }

  private setAggregation(): void {
    this.aggregation$ = combineLatest([
        this.pnl$,
        this.pnlCalculatedColumns$
    ]).pipe(
      map(([pnlCalculateds, pnlCalculatedColumns]) => {
        const reportAggregation = pnlCalculatedColumns.reduce(
          (aggregation, column) => {
            aggregation[column.field] = '';
            if (
              [
                'coupon',
                'dividend',
                'realizedpnl',
                'totalpnl',
                'unrealizedpnl'
              ].includes(column.field.toLowerCase())
            ) {
              const sumCol = pnlCalculateds.reduce(
                  (sum: number, row) => sum + <any>row[column.field],
                  0
                ),
                digitInfo = '1.2-2';
              aggregation[column.field] = `$${this.decimalPipe.transform(
                sumCol,
                digitInfo
              )}`;
            }
            return aggregation;
          },
          {}
        );
        return [reportAggregation];
      })
    );
  }
}
