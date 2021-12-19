import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';

import { ReportColumn, ReportingService } from '@pnkl-frontend/shared';
import { first } from 'rxjs/operators';
import { PositionsReportDataFilter } from './positions-report-data-filter.model';
import {
  AttemptLoadPositionsReportData,
  LoadPositionsReportData
} from './positions-report-data.actions';
import { PositionsReportDataEffects } from './positions-report-data.effects';

describe('PositionReportInfoService', () => {
  let actions$: Observable<any>;
  let effects: PositionsReportDataEffects;
  let service: ReportingService;

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
      type: 'text',
      formula: null,
      viewOrder: 15
    }
  ];

  const reportDataFilter: PositionsReportDataFilter = {
    id: 31,
    params: [
      {
        caption: 'As of Date',
        defaultValue: 'today',
        id: 28,
        name: 'posdate',
        required: true,
        type: 'date',
        value: '2018-11-30T13:17:01.859Z'
      }
    ],
    reportingColumns: [
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
        sortOrder: null,
        formula: null,
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
    ]
  };
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
  const reportingService = {
    getReportData: () => {}
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PositionsReportDataEffects,
        provideMockActions(() => actions$),
        {
          provide: ReportingService,
          useValue: reportingService
        }
      ]
    });

    effects = TestBed.inject(PositionsReportDataEffects);
    service = TestBed.inject(ReportingService);
  });

  describe('load$', () => {
    it('should dispatch load action if attempt suceeds', async () => {
      spyOn(service, 'getReportData').and.returnValue(
        Promise.resolve(reportData)
      );
      const action = new AttemptLoadPositionsReportData(reportDataFilter);
      actions$ = of(action);
      const completion = <LoadPositionsReportData>(
        await effects.load$.pipe(first()).toPromise()
      );
      const { positionsReportData } = completion.payload;
      for (let i = 0; i < positionsReportData.length; i++) {
        const { UpdatedAt, ...rest } = positionsReportData[i];
        expect(rest).toEqual({
          ...reportData[i],
          pnlRealized: 0,
          pnlUnRealized: 0
        });
        expect(UpdatedAt instanceof Date).toBe(true);
      }
    });
  });
});
