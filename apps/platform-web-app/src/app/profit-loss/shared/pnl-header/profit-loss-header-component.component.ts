import { Component, Input, OnInit } from '@angular/core';
import { AumBackendStateFacade } from '@pnkl-frontend/shared';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PnlBackendStateFacade } from '../pnl-backend-state/pnl-backend-state-facade.service';
import { PnlCalculatedAttribute } from '../pnl-backend/pnl-calculated-attribute/pnl-calculated-attribute.model';
import { PnlFilter } from '../pnl-backend/pnl-calculated/pnl-calculated-filter.model';
import { PnlUiStateFacadeService } from '../pnl-ui-state/pnl-ui-state-facade.service';

@Component({
  selector: 'profit-loss-header',
  templateUrl: './profit-loss-header-component.component.html',
  styleUrls: ['./profit-loss-header-component.component.scss']
})
export class ProfitLossHeaderComponentComponent implements OnInit {
  abs = Math.abs;
  filterValue$: Observable<PnlFilter>;
  mtdReturn$: Observable<number>;
  totalPnl$: Observable<number>;
  @Input() realTimePnl = false;
  today = new Date();
  constructor(
    private readonly aumBackendStateFacade: AumBackendStateFacade,
    private readonly pnlBackendStateFacade: PnlBackendStateFacade,
    private readonly pnlUiStateFacade: PnlUiStateFacadeService
  ) {}

  ngOnInit(): void {
    this.filterValue$ = this.pnlUiStateFacade.pnlFilterValue$;
    this.totalPnl$ = this.pnlBackendStateFacade.pnlCalculatedAttributes$.pipe(
      map(pnlCalculatedAttribs => pnlCalculatedAttribs.reduce(
          (total: number, pnlCalculatedAttrib: PnlCalculatedAttribute) =>
            (total + pnlCalculatedAttrib.totalPnl),
          0
        ))
    );
    this.mtdReturn$ = combineLatest([
      this.aumBackendStateFacade.aumValue$,
      this.totalPnl$
    ]).pipe(map(([aum, totalPnl]) => (totalPnl / aum) * 100));
  }
}
