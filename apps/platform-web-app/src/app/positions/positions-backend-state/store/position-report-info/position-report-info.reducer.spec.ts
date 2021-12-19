import { PositionsReportInfo } from '../../../positions-backend/positions-report-info/positions-report-info.model';
import {
  AttemptLoadPositionReportInfo,
  LoadPositionReportInfo,
  LoadPositionReportInfoFailed
} from './position-report-info.actions';
import { initialState, reducer } from './position-report-info.reducer';

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

describe('PositionReportInfo Reducer', () => {
  describe('AttemptLoadPositionReportInfo', () => {
    it('should set the loading to true and loaded to false', () => {
      const action = new AttemptLoadPositionReportInfo();

      const result = reducer(initialState, action);

      expect(result).toEqual({
        ...initialState,
        loaded: false,
        loading: true
      });
    });
  });
  describe('LoadPositionReportInfo', () => {
    it('should set the loading to false and loaded to true', () => {
      const action = new LoadPositionReportInfo({ positionsReportInfo });

      const result = reducer(initialState, action);

      expect(result).toEqual({
        loaded: true,
        loading: false
      });
    });
  });
  describe('LoadCustomAttributesFailed', () => {
    it('should set the loading to false and loaded to false', () => {
      const action = new LoadPositionReportInfoFailed({ error: 'testError' });

      const result = reducer(initialState, action);

      expect(result).toEqual({
        ...initialState,
        loaded: false,
        loading: false
      });
    });
  });
});
