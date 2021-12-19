import { PnlFilter } from '../../../pnl-backend/pnl-calculated/pnl-calculated-filter.model';
import {
  HideFilter,
  SetPnlFilter,
  ShowFilter,
  ToggleFilter
} from './pnl-filters.actions';
import { initialState, reducer } from './pnl-filters.reducer';

describe('PnlFilters Reducer', () => {
  describe('ToggelFilter', () => {
    it('should set the value of filterVisible to true', () => {
      const action = ToggleFilter();
      const result = reducer(initialState, action);
      expect(result).toEqual({
        ...initialState,
        filterVisible: !initialState.filterVisible
      });
    });
  });

  describe('HideFilter', () => {
    it('should set the value of filterVisible to false', () => {
      const action = HideFilter();
      const result = reducer({ ...initialState, filterVisible: true }, action);
      expect(result).toEqual({
        ...initialState,
        filterVisible: false
      });
    });
  });

  describe('SetPnlFilter', () => {
    it('should set the filterValue', () => {
      const filterValue: PnlFilter = {
        endDate: new Date(),
        startDate: new Date(),
        account: <any>{}
      };
      const action = SetPnlFilter({ payload: filterValue });
      const result = reducer(initialState, action);
      expect(result).toEqual({
        ...initialState,
        filterValue
      });
    });
  });

  describe('ShowFilter', () => {
    it('should set the value of filterVisible to true', () => {
      const action = ShowFilter();
      const result = reducer({ ...initialState, filterVisible: true }, action);
      expect(result).toEqual({
        ...initialState,
        filterVisible: true
      });
    });
  });
});
