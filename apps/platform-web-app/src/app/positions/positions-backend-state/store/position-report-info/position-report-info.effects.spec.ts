import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { PositionsReportInfo } from '../../../positions-backend/positions-report-info/positions-report-info.model';
import { PositionsReportInfoService } from '../../../positions-backend/positions-report-info/positions-report-info.service';
import { AttemptLoadPositionReportInfo, LoadPositionReportInfo } from './position-report-info.actions';

import { PositionReportInfoEffects } from './position-report-info.effects';

describe('PositionReportInfoService', () => {
  let actions$: Observable<any>;
  let effects: PositionReportInfoEffects;
  let service: PositionsReportInfoService;

  const positionsReportInfo: PositionsReportInfo = {
    reportColumns: [
      {
        caption: 'AccountCode',
        convertToBaseCurrency: false,
        decimalPlaces: null,
        filterValues: null,
        groupOrder: null,
        id: 285,
        isAggregating: false,
        name: 'AccountCode',
        renderingFunction: '',
        reportId: 31,
        sortAscending: null,
        sortOrder: null,
        type: 'text',
        formula: null,
        viewOrder: null
      }
    ],
    reportParameters: [
      {
        caption: 'As of Date',
        defaultValue: 'today',
        id: null,
        name: 'posdate',
        required: true,
        type: 'date',
        value: '2018-11-29T08:01:42.217Z'
      }
    ],
    userReportColumns: [
      {
        caption: 'Strategy',
        decimalPlaces: null,
        filterValues: null,
        groupOrder: null,
        id: 1001,
        isAggregating: false,
        name: 'Strategy',
        renderingFunction: 'NULL',
        reportColumnId: 312,
        sortAscending: null,
        sortOrder: null,
        type: 'text',
        formula: null,
        userReportId: 81,
        viewOrder: 1
      }
    ]
  };

  const positionsReportInfoService = {
    get: () => {}
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PositionReportInfoEffects,
        provideMockActions(() => actions$),
        {
          provide: PositionsReportInfoService,
          useValue: positionsReportInfoService
        }
      ]
    });

    effects = TestBed.inject(PositionReportInfoEffects);
    service = TestBed.inject(PositionsReportInfoService);
  });

  describe('load$', () => {
    it('should dispatch load action if attempt suceeds', () => {
      spyOn(service, 'get').and.returnValue(
        Promise.resolve(positionsReportInfo)
      );
      const action = new AttemptLoadPositionReportInfo(),
        completion = new LoadPositionReportInfo({ positionsReportInfo });

      actions$ = of(action);
      effects.load$.subscribe(result => expect(result).toEqual(completion));
    });
  });
});
