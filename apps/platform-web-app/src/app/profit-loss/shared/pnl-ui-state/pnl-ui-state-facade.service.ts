import { Injectable } from '@angular/core';
import { Dictionary } from '@ngrx/entity';
import { select, Store } from '@ngrx/store';
import { PinnaklSpinner } from '@pnkl-frontend/core';
import { PinnaklColDef, PositionsPnlDataFieldsBackendStateFacade, Utility } from '@pnkl-frontend/shared';
import { groupBy, meanBy, sumBy } from 'lodash';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PnlBackendStateFacade } from '../pnl-backend-state/pnl-backend-state-facade.service';
import { PnlCalculatedAttribute } from '../pnl-backend/pnl-calculated-attribute/pnl-calculated-attribute.model';
import { PnlCalculatedTimeseriesFilter } from '../pnl-backend/pnl-calculated-timeseries/pnl-calculated-timeseries-filter.model';
import { PnlCalculatedTimeseries } from '../pnl-backend/pnl-calculated-timeseries/pnl-calculated-timeseries.model';
import { PnlCalculatedTimeseriesService } from '../pnl-backend/pnl-calculated-timeseries/pnl-calculated-timeseries.service';
import { PnlFilter } from '../pnl-backend/pnl-calculated/pnl-calculated-filter.model';
import { PnlDashboardWidget } from './models/pnl-dashboard-widget.model';
import { PnlTreeMapData, SecurityPnlInfo } from './models/pnl-tree-map-data.model';
import {
  AddPnlCalculatedColumnsSelected,
  HideFilter,
  RemoveField,
  RemovePnlCalculatedColumnsSelected,
  SelectFields,
  SelectInitialFields,
  selectInitialPnlFieldsSelected,
  selectPnlCalculatedColumnSelections,
  selectPnlCalculatedColumnsSelected,
  selectPnlFieldsSelected,
  selectPnlFilterValue,
  selectPnlFilterVisible,
  SetPnlFilterFromUi,
  State as PnlUiState
} from './store';
import {
  SubscribeToRealTimePnl,
  SubscribeToRealTimePricePnl,
  UnSubscribeToRealTimePnl,
  UnSubscribeToRealTimePricePnl
} from './store/real-time-pnl';

@Injectable()
export class PnlUiStateFacadeService {
  constructor(
    private readonly _pnlBackendStateFacade: PnlBackendStateFacade,
    private readonly _positionsPnlDataFieldsBackendStateFacade: PositionsPnlDataFieldsBackendStateFacade,
    private readonly _pnlCalculatedTimeseriesService: PnlCalculatedTimeseriesService,
    private readonly _store: Store<PnlUiState>,
    private readonly _spinner: PinnaklSpinner,
    private readonly utility: Utility
  ) {}
  private _pnlCalculatedTimeSeries$ = new BehaviorSubject<
    PnlCalculatedTimeseries[]
  >([]);
  private _pnlCalculatedTimeSeriesFilter$ = new BehaviorSubject<
    PnlCalculatedTimeseriesFilter
  >(null);

  pnlCalculatedColumns$: Observable<PinnaklColDef[]> = this._store.pipe(
    select(selectPnlCalculatedColumnsSelected)
  );
  pnlCalculatedColumnSelections$ = this._store.pipe(
    select(selectPnlCalculatedColumnSelections)
  );
  pnlCalculatedTimeSeries$ = this._pnlCalculatedTimeSeries$.asObservable().pipe(
    map(data => {
      // We need to handle the issue with kendo stock charts when last item is not shown on chart and use this approach
      // https://www.telerik.com/forums/stockchart-do-not-display-last-item-from-datasource
      if (data.length > 1) {
        const objToInsert: any = { ...data[data.length - 1] };
        for (const key of Object.keys(objToInsert)) {
          objToInsert[key] = key === 'date' ?
            new Date(new Date(objToInsert[key].getTime()).setDate(objToInsert[key].getDate() + 1)) : 0;
        }
        data.push(objToInsert);
      }
      return data;
    })
  );
  pnlCalculatedTimeSeriesFilter$ = this._pnlCalculatedTimeSeriesFilter$.asObservable();
  pnlFieldsSelected$: Observable<number[]> = this._store.select(
    selectPnlFieldsSelected
  );
  initialPnlFieldsSelected$: Observable<number[]> = this._store.select(
    selectInitialPnlFieldsSelected
  );
  // TODO: Add tests
  pnlDashboardWidgets$ = this._createPnlDashboardWidgets();
  pnlTreeMapData$ = this._createPnlTreeMapData();

  pnlFilterValue$: Observable<PnlFilter> = this._store.select(
    selectPnlFilterValue
  );
  pnlFilterVisible$ = this._store.pipe(select(selectPnlFilterVisible));
  addPnlCalculatedColumn(column: string): void {
    this._store.dispatch(AddPnlCalculatedColumnsSelected({ column }));
  }
  hideFilter(): void {
    this._store.dispatch(HideFilter());
  }
  removePnlCalculatedColumn(column: string): void {
    this._store.dispatch(RemovePnlCalculatedColumnsSelected({ column }));
  }
  removePnlField({ id }: { id: number }): void {
    this._store.dispatch(RemoveField({ id }));
  }
  selectPnlFields({ ids }: { ids: number[] }): void {
    this._store.dispatch(SelectFields({ ids }));
  }
  selectInitialPnlFields({ ids }: { ids: number[] }): void {
    this._store.dispatch(SelectInitialFields({ ids }));
  }
  setPnlFilter(pnlFilter: PnlFilter): void {
    this._store.dispatch(SetPnlFilterFromUi({ payload: pnlFilter }));
  }
  async setPnlCalculatedTimeseriesFilter(
    pnlCalculatedTimeseriesFilter: PnlCalculatedTimeseriesFilter,
    showSpinner: boolean = true
  ): Promise<void> {
    try {
      if (showSpinner) {
        this._spinner.spin();
      }
      const timeSeries = await this._pnlCalculatedTimeseriesService.getMany(
        pnlCalculatedTimeseriesFilter
      );
      this._pnlCalculatedTimeSeriesFilter$.next(pnlCalculatedTimeseriesFilter);
      this._pnlCalculatedTimeSeries$.next(timeSeries);
      this._spinner.stop();
    } catch (e) {
      this.utility.showError(e);
    }
  }

  subscribeToRealTimePnl(): void {
    this._store.dispatch(SubscribeToRealTimePnl());
  }

  unSubscribeToRealTimePnl(): void {
    this._store.dispatch(UnSubscribeToRealTimePnl());
  }

  subscribeToRealTimePricePnl(): void {
    this._store.dispatch(SubscribeToRealTimePricePnl());
  }

  unSubscribeToRealTimePricePnl(): void {
    this._store.dispatch(UnSubscribeToRealTimePricePnl());
  }

  private _createPnlDashboardWidgets(): Observable<PnlDashboardWidget[]> {
    return combineLatest([
      this._pnlBackendStateFacade.pnlCalculatedAttributes$,
      this._positionsPnlDataFieldsBackendStateFacade.positionsPnlDataFields$,
      this.initialPnlFieldsSelected$
    ]).pipe(
      map(([pnlCalculatedAttributes, allFields, selectedFieldIds]) => {
        if (!selectedFieldIds) {
          return [];
        }
        return selectedFieldIds.map(id => {
          const pnlField = allFields.find(f => f.id === id);
          const pnlsToUse = pnlCalculatedAttributes;
          const groupingKey =
            pnlField.name === 'Security' ? 'ticker' : pnlField.field;
          const groups = groupBy(pnlsToUse, groupingKey);
          const widgetData = Object.keys(groups).map(fieldValue => {
            const pnls = groups[fieldValue];
            const totalPnl = sumBy(pnls, pnl => (<any>pnl).totalPnl);
            return { fieldValue, pnl: totalPnl };
          });
          return {
            fieldName: pnlField.name,
            fieldId: pnlField.id,
            widgetData
          };
        });
      })
    );
  }

  private _createPnlTreeMapData(): Observable<PnlTreeMapData> {
    return combineLatest([
      this._pnlBackendStateFacade.pnlCalculatedAttributes$,
      this._positionsPnlDataFieldsBackendStateFacade.positionsPnlDataFields$,
      this.pnlFieldsSelected$
    ]).pipe(
      map(([pnlCalculatedAttributes, allFields, selectedFieldIds]) => {
        if (!selectedFieldIds) {
          return null;
        }
        const id = selectedFieldIds[0];
        const pnlField = allFields.find(f => f.id === id);
        const pnlsToUse = pnlCalculatedAttributes;

        const groupingKey =
          pnlField.name === 'Security' ? 'ticker' : pnlField.field;
        const groups = groupBy(pnlsToUse, groupingKey);

        if (pnlField.name === 'Security') {
          return {
            fieldId: pnlField.id,
            fieldName: pnlField.name,
            pnlData: this.getSecurityPnls(groups)
          };
        } else {
          const pnlData: {
            fieldValue: string;
            pnls: SecurityPnlInfo[];
          }[] = Object.keys(groups).map(fieldValue => {
            const securityGroups = groupBy(groups[fieldValue], 'ticker');
            const securityPnls: SecurityPnlInfo[] = this.getSecurityPnls(
              securityGroups
            );
            if (fieldValue == null || fieldValue === '') {
              fieldValue = 'BLANK';
            }
            return { fieldValue, pnls: securityPnls };
          });
          return { fieldId: pnlField.id, fieldName: pnlField.name, pnlData };
        }
      })
    );
  }

  private getSecurityPnls(
    securityGroups: Dictionary<PnlCalculatedAttribute[]>
  ): SecurityPnlInfo[] {
    return Object.keys(securityGroups).map(fieldValue1 => {
      const pnls = securityGroups[fieldValue1];
      const totalPnl = sumBy(pnls, pnl =>
        (<any>pnl).totalPnl ? (<any>pnl).totalPnl : 0
      );
      const position = sumBy(pnls, pnl => (pnl.position ? pnl.position : 0));
      const price = meanBy(pnls, pnl => (pnl.price ? pnl.price : 0));
      return { ticker: pnls[0].ticker, position, price, totalPnl };
    });
  }
}
