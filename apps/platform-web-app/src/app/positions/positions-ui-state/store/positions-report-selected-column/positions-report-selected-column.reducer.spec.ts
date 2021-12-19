import {
  AddPositionsReportSelectedColumns,
  DeletePositionsReportSelectedColumns,
  LoadPositionsReportSelectedColumns,
  UpdatePositionsReportSelectedColumns
} from './positions-report-selected-column.actions';
import {
  initialState,
  reducer
} from './positions-report-selected-column.reducer';

import { ReportingColumn } from '@pnkl-frontend/shared';

const reportingColumn1 = {
  name: 'a',
  reportingColumnType: 'report',
  viewOrder: 0,
  filters: ['a1']
} as ReportingColumn;
const reportingColumn2 = {
  name: 'b',
  reportingColumnType: 'ca',
  viewOrder: 1,
  filters: ['b1']
} as ReportingColumn;

const positionsReportSelectedColumns = [reportingColumn1, reportingColumn2];

describe('PositionsReportSelectedColumn Reducer', () => {
  describe('AddPositionsReportSelectedColumns', () => {
    it('should add the provided columns', () => {
      let result = reducer(
        initialState,
        AddPositionsReportSelectedColumns({ positionsReportSelectedColumns: [reportingColumn1] })
      );
      expect(result).toEqual({ entities: [reportingColumn1] });
      result = reducer(
        result,
        AddPositionsReportSelectedColumns({ positionsReportSelectedColumns: [reportingColumn2] })
      );
      expect(result).toEqual({ entities: positionsReportSelectedColumns });
    });
  });
  describe('DeletePositionsReportSelectedColumns', () => {
    it('should delete the provided columns', () => {
      const populatedState = reducer(
        initialState,
        LoadPositionsReportSelectedColumns({ positionsReportSelectedColumns })
      );
      const action = DeletePositionsReportSelectedColumns({
        payload: {
          positionsReportSelectedColumns: [
            { name: 'b', reportingColumnType: 'ca' }
          ]
        }
      });
      const result = reducer(populatedState, action);
      expect(result).toEqual({
        entities: [reportingColumn1]
      });
    });
  });
  describe('LoadPositionsReportSelectedColumns', () => {
    it('should load the provided columns', () => {
      const action = LoadPositionsReportSelectedColumns({ positionsReportSelectedColumns });
      const result = reducer(initialState, action);
      expect(result).toEqual({ entities: positionsReportSelectedColumns });
    });
  });
  describe('UpdatePositionsReportSelectedColumns', () => {
    it('should update the provided columns', () => {
      const populatedState = reducer(
        initialState,
        LoadPositionsReportSelectedColumns({ positionsReportSelectedColumns })
      );
      const action = UpdatePositionsReportSelectedColumns({
        positionsReportSelectedColumns: [
          { name: 'b', reportingColumnType: 'ca', viewOrder: 0 },
          {
            name: 'a',
            reportingColumnType: 'report',
            viewOrder: 1,
            filters: ['a2']
          }
        ]
      });
      const result = reducer(populatedState, action);
      expect(result).toEqual({
        entities: [
          {
            name: 'a',
            reportingColumnType: 'report',
            viewOrder: 1,
            filters: ['a2']
          },
          {
            name: 'b',
            reportingColumnType: 'ca',
            viewOrder: 0,
            filters: ['b1']
          }
        ] as ReportingColumn[]
      });
    });
  });
});
