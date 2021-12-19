import { TestBed } from '@angular/core/testing';

import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { first } from 'rxjs/operators';

import { ReportingColumn } from '@pnkl-frontend/shared';
import { UpdatePositionsReportSelectedColumns } from '../positions-report-selected-column/positions-report-selected-column.actions';
import {
  UpdateGroupOrders,
  UpdateSortOrders,
  UpdateViewOrders
} from './positions-grid.actions';
import { PositionsGridEffects } from './positions-grid.effects';

describe('PositionsGridEffects', () => {
  let actions$: Observable<any>;
  let effects: PositionsGridEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PositionsGridEffects, provideMockActions(() => actions$)]
    });
    effects = TestBed.inject(PositionsGridEffects);
  });

  describe('updateGroupOrders$', () => {
    it('should dispatch updateColumns action for updated group orders', async () => {
      actions$ = of(
        new UpdateGroupOrders({
          groupOrders: [
            { name: 'AccountCode', groupOrder: 1 },
            { name: 'Sector', groupOrder: 2 }
          ],
          selectedColumns: [
            { name: 'AssetType', reportingColumnType: 'report', groupOrder: 1 },
            {
              name: 'AccountCode',
              reportingColumnType: 'report',
              groupOrder: 2
            },
            { name: 'Sector', reportingColumnType: 'report', groupOrder: 3 }
          ] as ReportingColumn[]
        })
      );
      const result = await effects.updateGroupOrders$.pipe(first()).toPromise();
      expect(result).toEqual(
        new UpdatePositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            {
              name: 'AccountCode',
              reportingColumnType: 'report',
              groupOrder: 1
            },
            { name: 'Sector', reportingColumnType: 'report', groupOrder: 2 },
            {
              name: 'AssetType',
              reportingColumnType: 'report',
              groupOrder: null
            }
          ]
        })
      );
    });
  });

  describe('updateSortOrders$', () => {
    it('should dispatch updateColumns action for updated sort orders', async () => {
      actions$ = of(
        new UpdateSortOrders({
          sortOrders: [
            { name: 'AccountCode', sortAscending: true, sortOrder: 1 },
            { name: 'Sector', sortAscending: false, sortOrder: 2 }
          ],
          selectedColumns: [
            {
              name: 'AssetType',
              reportingColumnType: 'report',
              sortAscending: true,
              sortOrder: 1
            },
            {
              name: 'AccountCode',
              reportingColumnType: 'report',
              sortAscending: false,
              sortOrder: 2
            },
            {
              name: 'Sector',
              reportingColumnType: 'report',
              sortAscending: true,
              sortOrder: 3
            }
          ] as ReportingColumn[]
        })
      );
      const result = await effects.updateSortOrders$.pipe(first()).toPromise();
      expect(result).toEqual(
        new UpdatePositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            {
              name: 'AccountCode',
              reportingColumnType: 'report',
              sortAscending: true,
              sortOrder: 1
            },
            {
              name: 'Sector',
              reportingColumnType: 'report',
              sortAscending: false,
              sortOrder: 2
            },
            {
              name: 'AssetType',
              reportingColumnType: 'report',
              sortAscending: null,
              sortOrder: null
            }
          ]
        })
      );
    });
  });

  describe('updateViewOrders$', () => {
    it('should dispatch updateColumns action for updated view orders', async () => {
      actions$ = of(
        new UpdateViewOrders({
          viewOrders: [
            { name: 'AccountCode', viewOrder: 1 },
            { name: 'Sector', viewOrder: 2 }
          ],
          selectedColumns: [
            {
              name: 'AssetType',
              reportingColumnType: 'report',
              viewOrder: 1
            },
            {
              name: 'AccountCode',
              reportingColumnType: 'report',
              viewOrder: 2
            },
            {
              name: 'Sector',
              reportingColumnType: 'report',
              viewOrder: 3
            }
          ] as ReportingColumn[]
        })
      );
      const result = await effects.updateViewOrders$.pipe(first()).toPromise();
      expect(result).toEqual(
        new UpdatePositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            {
              name: 'AccountCode',
              reportingColumnType: 'report',
              viewOrder: 1
            },
            {
              name: 'Sector',
              reportingColumnType: 'report',
              viewOrder: 2
            },
            {
              include: false,
              name: 'AssetType',
              reportingColumnType: 'report',
              viewOrder: -1
            }
          ]
        })
      );
    });
  });
});
