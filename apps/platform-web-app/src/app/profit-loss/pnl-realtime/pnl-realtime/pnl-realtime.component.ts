import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageSubscriptionsHandler } from '@pnkl-frontend/core';

import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  AccountsBackendStateFacade,
  AumBackendStateFacade,
  PositionsPnlDataFieldsBackendStateFacade
} from '@pnkl-frontend/shared';
import { PnlBackendStateFacade } from '../../shared/pnl-backend-state/pnl-backend-state-facade.service';
import { PnlDashboardWidget } from '../../shared/pnl-ui-state/models/pnl-dashboard-widget.model';
import { PnlTreeMapData, SecurityPnlInfo } from '../../shared/pnl-ui-state/models/pnl-tree-map-data.model';
import { PnlUiStateFacadeService } from '../../shared/pnl-ui-state/pnl-ui-state-facade.service';

@Component({
  selector: 'pnl-realtime',
  templateUrl: './pnl-realtime.component.html',
  styleUrls: ['./pnl-realtime.component.scss']
})
export class PnlRealtimeComponent implements OnDestroy, OnInit {
  requiredEstablishedStreamsReady$: Observable<boolean>;
  requiredStreamsErrored$: Observable<boolean>;

  pnlDashboardWidgets$: Observable<PnlDashboardWidget[]>;
  treemapData$: Observable<PnlTreeMapData>;
  treemapTitle$: Observable<string>;

  constructor(
    public accountsBackendStateFacade: AccountsBackendStateFacade,
    private readonly aumBackendStateFacade: AumBackendStateFacade,
    public positionsPnlDataFieldsBackendStateFacade: PositionsPnlDataFieldsBackendStateFacade,
    public pnlBackendStateFacade: PnlBackendStateFacade,
    public pnlUiStateFacade: PnlUiStateFacadeService,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _pageSubscriptionsHandler: PageSubscriptionsHandler
  ) {
    this._activatedRoute.data.subscribe(data => {
      if (data.requiredEstablishedStreamsCount || data.requiredEstablishedStreamsCount === 0) {
        const { established, errored } = this._pageSubscriptionsHandler
          .startStreamsEstablishingHandling(data.requiredEstablishedStreamsCount);
        this.requiredEstablishedStreamsReady$ = established;
        this.requiredStreamsErrored$ = errored;
      }
    });
  }

  fieldsChanged(ids: number[]): void {
    this.pnlUiStateFacade.selectPnlFields({ ids });
  }

  ngOnDestroy(): void {
    this.pnlUiStateFacade.unSubscribeToRealTimePnl();
    this.pnlUiStateFacade.unSubscribeToRealTimePricePnl();
  }

  ngOnInit(): void {
    this.pnlUiStateFacade.subscribeToRealTimePnl();
    this.pnlUiStateFacade.subscribeToRealTimePricePnl();
    this.pnlDashboardWidgets$ = this.pnlUiStateFacade.pnlDashboardWidgets$;
    this.treemapData$ = combineLatest([
      this.pnlUiStateFacade.pnlTreeMapData$,
      this.aumBackendStateFacade.aumValue$
    ]).pipe(
      map(([pnlTreeMapData, aum]) => {
        if (pnlTreeMapData.fieldName.toLowerCase() === 'security') {
          (pnlTreeMapData.pnlData as SecurityPnlInfo[]).map(item => {
            item.totalPnl = item.totalPnl * (100 / aum);
            return item;
          });
        } else {
          pnlTreeMapData.pnlData.map(
            (category: { fieldValue: string; pnls: SecurityPnlInfo[] }) =>
              category.pnls.map(item => {
                item.totalPnl = item.totalPnl * (100 / aum);
                return item;
              })
          );
        }
        return pnlTreeMapData;
      })
    );
    this.treemapTitle$ = this.pnlUiStateFacade.pnlDashboardWidgets$.pipe(
      map(([widget]) => widget.fieldName)
    );
  }
}
