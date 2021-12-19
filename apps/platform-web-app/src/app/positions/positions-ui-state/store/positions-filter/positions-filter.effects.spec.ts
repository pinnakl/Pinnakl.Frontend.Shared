import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Store, StoreModule } from '@ngrx/store';

import { Observable } from 'rxjs';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import {
  ReportColumn,
  ReportingColumn,
  ReportParameter,
  Utility
} from '@pnkl-frontend/shared';
import { reducers as backendStateReducers } from '../../../positions-backend-state';
import {
  AttemptLoadPositionsReportData,
  LoadPositionsReportData,
  LoadPositionsReportDataFailed
} from '../../../positions-backend-state/store/positions-report-data/positions-report-data.actions';
import { LoadReportColumns } from '../../../positions-backend-state/store/report-column/report-column.actions';
import {
  reducers,
  State
} from '../../store';
import { LoadPositionsReportParameterValues } from '../positions-report-parameter-value/positions-report-parameter-value.actions';
import { PositionsReportParameterValue } from '../positions-report-parameter-value/positions-report-parameter-value.model';
import { LoadPositionsReportSelectedColumns } from '../positions-report-selected-column/positions-report-selected-column.actions';
import { ApplyPositionsFilter } from './positions-filter.actions';
import { PositionsFilterEffects } from './positions-filter.effects';

const reportColumns: ReportColumn[] = [
  {
    caption: 'AccountCode',
    convertToBaseCurrency: undefined,
    decimalPlaces: null,
    filterValues: null,
    groupOrder: null,
    id: 1015,
    isAggregating: false,
    name: 'AccountCode',
    renderingFunction: 'NULL',
    reportId: 3,
    sortAscending: null,
    sortOrder: null,
    formula: null,
    type: 'text',
    viewOrder: 15
  }
];

const reportData: any[] = [
  {
    AccountCode: 'CMST',
    Analyst: 'KB',
    AssetType: 'BANKDEBT',
    Description: 'Affinion TL ',
    FolderCode: 'AFGR',
    Identifier: '00826BAD9',
    LocalCurrency: 'USD',
    MVUSD: 4026677.745667,
    MVUSDPct: 0,
    Position: 3968812.46,
    PriceLocal: 101.458,
    Sector: 'COMMUNICATIONS',
    SecurityId: '1426',
    Strategy: 'COR',
    Ticker: 'AFFI',
    Trader: 'KC',
    securityId: null
  }
];

const reportingColumns: ReportingColumn[] = [
  {
    dbId: 1015,
    convertToBaseCurrency: undefined,
    caption: 'AccountCode',
    name: 'AccountCode',
    reportingColumnType: 'report',
    type: 'text',
    decimalPlaces: null,
    filters: null,
    groupOrder: null,
    include: true,
    isAggregating: false,
    renderingFunction: 'NULL',
    sortAscending: null,
    formula: null,
    sortOrder: null,
    viewOrder: 15
  },
  {
    dbId: 1013,
    convertToBaseCurrency: undefined,
    caption: 'Analyst',
    name: 'Analyst',
    reportingColumnType: 'report',
    type: 'text',
    decimalPlaces: null,
    filters: null,
    groupOrder: null,
    include: true,
    isAggregating: false,
    renderingFunction: 'NULL',
    sortAscending: null,
    formula: null,
    sortOrder: null,
    viewOrder: 13
  },
  {
    dbId: 1003,
    convertToBaseCurrency: undefined,
    caption: 'AssetType',
    name: 'AssetType',
    reportingColumnType: 'report',
    type: 'text',
    decimalPlaces: null,
    filters: null,
    groupOrder: null,
    include: true,
    isAggregating: false,
    renderingFunction: 'NULL',
    sortAscending: null,
    formula: null,
    sortOrder: null,
    viewOrder: 3
  }
];

const params: ReportParameter[] = [
  {
    caption: 'As of Date',
    defaultValue: 'today',
    id: 28,
    name: 'posdate',
    required: true,
    type: 'date',
    value: '2018-11-30T13:17:01.859Z'
  }
];

const positionsReportParameterValues: PositionsReportParameterValue[] = [
  {
    id: 28,
    value: '2018-11-30T13:17:01.859Z'
  }
];

describe('PositionsFilterService', () => {
  const actions$: Observable<any> = new Observable<any>();
  let effects: PositionsFilterEffects,
    pnklSpinnner: PinnaklSpinner,
    store: Store<State>,
    utilityService: Utility;

  const mockSpinnerService = {
    spin: () => { },
    stop: () => { }
  },
    mockUtilityService = {
      showError: () => { }
    };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature('positionsBackend', backendStateReducers),
        StoreModule.forFeature('positionsUi', reducers)
      ],
      providers: [
        PositionsFilterEffects,
        provideMockActions(() => actions$),
        { provide: PinnaklSpinner, useValue: mockSpinnerService },
        { provide: Utility, useValue: mockUtilityService }
      ]
    });

    effects = TestBed.inject(PositionsFilterEffects);
    store = TestBed.inject(Store);
    pnklSpinnner = TestBed.inject(PinnaklSpinner);
    utilityService = TestBed.inject(Utility);
  });

  describe('applyPositionsFilter$', () => {
    it('should dispatch AttemptloadPositionsReportData action', () => {
      store.dispatch(LoadReportColumns({ reportColumns }));
      store.dispatch(
        LoadPositionsReportParameterValues({
          positionsReportParameterValues
        })
      );
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: reportingColumns
        })
      );

      store.dispatch(ApplyPositionsFilter({ idcColumnsAdded: [] }));

      const completion = AttemptLoadPositionsReportData({
        payload: {
          id: reportColumns[0].id,
          params,
          reportingColumns
        }
      });
      effects.applyPositionsFilter$.subscribe(result =>
        expect(result).toEqual(completion)
      );
    });
  });

  describe('applyPositionsFilterSpinner$', () => {
    it('should start spinner on apply filter and stop when attempt report data comes', () => {
      const pnklSpinnerSpy = spyOn(pnklSpinnner, 'spin');
      const stopSpinnerSpy = spyOn(pnklSpinnner, 'stop');

      expect(pnklSpinnerSpy.calls.any()).toEqual(false);

      store.dispatch(ApplyPositionsFilter({ idcColumnsAdded: [] }));

      effects.applyPositionsFilterSpinner$.subscribe(() =>
        expect(pnklSpinnerSpy.calls.any()).toEqual(true)
      );

      store.dispatch(
        LoadPositionsReportData({ positionsReportData: reportData })
      );

      effects.applyPositionsFilterSpinner$.subscribe(() =>
        expect(stopSpinnerSpy.calls.any()).toEqual(true)
      );
    });

    it('should show error taoster on loadPOsitionsReportData fail', () => {
      const errorSpy = spyOn(utilityService, 'showError');
      store.dispatch(ApplyPositionsFilter({ idcColumnsAdded: [] }));

      effects.applyPositionsFilterSpinner$.subscribe(() =>
        expect(errorSpy.calls.any()).toEqual(false)
      );

      store.dispatch(LoadPositionsReportDataFailed({ error: 'testError' }));

      effects.applyPositionsFilterSpinner$.subscribe(() =>
        expect(errorSpy.calls.any()).toEqual(true)
      );
    });
  });
});
