import { initialState, reducer } from './aum.reducer';

import { AttemptLoadAum, LoadAum } from './aum.actions';

describe('Aum Reducer', () => {
  describe('AttemptLoadAum', () => {
    it('should set the AUM criteria and unset the current AUM', () => {
      const accountId = 1;
      const date = new Date();
      const action = new AttemptLoadAum({ accountId, date });
      const result = reducer({ aum: 9.99 }, action);
      expect(result).toEqual({ accountId, date });
    });
  });
  describe('LoadAum', () => {
    it('should set the AUM value', () => {
      const aum = 78900.821;
      const action = new LoadAum({ aum });
      const result = reducer(initialState, action);
      expect(result).toEqual({ ...initialState, aum });
    });
  });
});
