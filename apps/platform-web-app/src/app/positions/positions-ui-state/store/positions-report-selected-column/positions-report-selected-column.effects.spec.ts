import { TestBed } from '@angular/core/testing';

import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';

import {
  ClientReportColumn,
  ReportingColumn,
  UserReportColumn,
  UserReportCustomAttribute,
  UserReportIdcColumn
} from '@pnkl-frontend/shared';
import { LoadClientReportColumns } from '../../../positions-backend-state/store/client-report-column/client-report-column.actions';
import { LoadUserReportColumns } from '../../../positions-backend-state/store/user-report-column/user-report-column.actions';
import { LoadUserReportCustomAttributes } from '../../../positions-backend-state/store/user-report-custom-attribute-column/user-report-custom-attribute.actions';
import { LoadUserReportIdcColumns } from '../../../positions-backend-state/store/user-report-idc-column/user-report-idc-column.actions';
import { LoadPositionsReportSelectedColumns } from './positions-report-selected-column.actions';
import { PositionsReportSelectedColumnEffects } from './positions-report-selected-column.effects';

const clientReportColumn: ClientReportColumn = {
  caption: 'Security Id',
  clientReportId: 3,
  decimalPlaces: 5,
  filterValues: 5.5,
  groupOrder: 1,
  id: 1,
  isAggregating: true,
  name: 'SecurityId',
  reportColumnId: 44,
  sortAscending: true,
  sortOrder: 5,
  type: 'string',
  viewOrder: 9
};
const crcReportingColumn: ReportingColumn = {
  caption: 'Security Id',
  decimalPlaces: 5,
  groupOrder: 1,
  isAggregating: true,
  name: 'SecurityId',
  sortAscending: true,
  sortOrder: 5,
  type: 'string',
  viewOrder: 9,
  // specific to reporting column
  convertToBaseCurrency: false,
  dbId: 44,
  filters: 5.5,
  include: true,
  renderingFunction: null,
  formula: null,
  reportingColumnType: 'report'
};

const userReportColumn: UserReportColumn = {
  caption: 'Asset Type',
  decimalPlaces: 0,
  filterValues: ['dd'],
  groupOrder: 0,
  id: 5,
  isAggregating: false,
  name: 'AssetType',
  renderingFunction: '',
  reportColumnId: 2,
  sortAscending: true,
  sortOrder: 8,
  type: 'text',
  formula: null,
  userReportId: 88,
  viewOrder: -1
};
const urcReportingColumn: ReportingColumn = {
  caption: 'Asset Type',
  decimalPlaces: 0,
  groupOrder: 0,
  isAggregating: false,
  name: 'AssetType',
  renderingFunction: '',
  sortAscending: true,
  sortOrder: 8,
  type: 'text',
  viewOrder: -1,
  // specific to reporting column
  convertToBaseCurrency: false,
  dbId: 5,
  filters: ['dd'],
  include: false,
  formula: null,
  reportingColumnType: 'report'
};

const userReportCustomAttribute: UserReportCustomAttribute = {
  customAttributeId: 1,
  filterValues: ['dd'],
  groupOrder: 0,
  id: 5,
  isAggregating: false,
  name: 'AssetType',
  sortAscending: true,
  sortOrder: 8,
  type: 'text',
  userReportId: 88,
  viewOrder: 9
};
const urcaReportingColumn: ReportingColumn = {
  groupOrder: 0,
  isAggregating: false,
  name: 'AssetType',
  sortAscending: true,
  sortOrder: 8,
  type: 'text',
  viewOrder: 9,
  // specific to reporting column
  caption: 'AssetType',
  convertToBaseCurrency: false,
  dbId: 5,
  decimalPlaces: null,
  filters: ['dd'],
  include: true,
  formula: null,
  renderingFunction: null,
  reportingColumnType: 'ca'
};
const userReportIdcColumn: UserReportIdcColumn = {
  caption: 'Instrument Id',
  filterValues: ['dd'],
  groupOrder: 0,
  id: 5,
  idcColumnId: 7,
  isAggregating: false,
  name: 'InstrumentId',
  sortAscending: true,
  sortOrder: 8,
  type: 'text',
  userReportId: 88,
  viewOrder: -1
};
const uridcReportingColumn: ReportingColumn = {
  caption: 'Instrument Id',
  groupOrder: 0,
  isAggregating: false,
  name: 'InstrumentId',
  sortAscending: true,
  sortOrder: 8,
  type: 'text',
  viewOrder: -1,
  // specific to reporting column
  convertToBaseCurrency: false,
  dbId: 5,
  decimalPlaces: null,
  formula: null,
  filters: ['dd'],
  include: false,
  renderingFunction: null,
  reportingColumnType: 'idc'
};

describe('PositionsReportSelectedColumnEffects', () => {
  let actions$: Observable<any>;
  let effects: PositionsReportSelectedColumnEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PositionsReportSelectedColumnEffects,
        provideMockActions(() => actions$)
      ]
    });
    effects = TestBed.inject(PositionsReportSelectedColumnEffects);
  });

  describe('loadClientReportColumns$', () => {
    it('should load reporting columns for the provided ClientReportColumns', async () => {
      actions$ = of(
        new LoadClientReportColumns({
          clientReportColumns: [clientReportColumn]
        })
      );
      const result = await getObservableCurrentValue(
        effects.loadClientReportColumns$
      );
      expect(result).toEqual(
        new LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [crcReportingColumn]
        })
      );
    });
  });

  describe('loadUserReportColumns$', () => {
    it('should load reporting columns for the provided UserReportColumns', async () => {
      actions$ = of(
        new LoadUserReportColumns({ userReportColumns: [userReportColumn] }),
        new LoadUserReportCustomAttributes({
          userReportCustomAttributes: [userReportCustomAttribute]
        }),
        new LoadUserReportIdcColumns({
          userReportIdcColumns: [userReportIdcColumn]
        })
      );
      const result = await getObservableCurrentValue(
        effects.loadUserReportColumns$
      );
      expect(result).toEqual(
        new LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            urcReportingColumn,
            urcaReportingColumn,
            uridcReportingColumn
          ]
        })
      );
    });
  });
});

async function getObservableCurrentValue<T>(
  observable: Observable<T>
): Promise<T> {
  return observable.pipe(take(1)).toPromise();
}
