import { IdcColumn } from '@pnkl-frontend/shared';
import {
  AttemptLoadIdcColumns,
  LoadIdcColumns,
  LoadIdcColumnsFailed
} from './idc-column.actions';
import { initialState, reducer } from './idc-column.reducer';

const idcColumn = new IdcColumn(1, 'Internal Rating', 'internal rating pnkl');

describe('IdcColumn Reducer', () => {
  describe('AttemptIdcColumn', () => {
    it('should set the loading to true and loaded to false', () => {
      const action = new AttemptLoadIdcColumns();

      const result = reducer(initialState, action);

      expect(result).toEqual({
        ...initialState,
        loaded: false,
        loading: true
      });
    });
  });
  describe('LoadCustomAttributes', () => {
    it('should populate idcColumns and set the loading to false and loaded to true', () => {
      const action = new LoadIdcColumns({
        idcColumns: [idcColumn]
      });

      const result = reducer(initialState, action);

      expect(result).toEqual({
        entities: { [idcColumn.id]: idcColumn },
        loaded: true,
        loading: false,
        ids: [idcColumn.id]
      });
    });
  });
  describe('LoadCustomAttributesFailed', () => {
    it('should set the loading to false and loaded to true', () => {
      const action = new LoadIdcColumnsFailed({
        error: 'test error'
      });

      const result = reducer(initialState, action);

      expect(result).toEqual({
        ...initialState,
        loaded: false,
        loading: false
      });
    });
  });
});
