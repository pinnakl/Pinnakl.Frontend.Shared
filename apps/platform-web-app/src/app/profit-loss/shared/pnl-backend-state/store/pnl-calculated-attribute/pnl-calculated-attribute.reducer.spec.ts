import { PnlCalculatedAttribute } from '../../../pnl-backend/pnl-calculated-attribute/pnl-calculated-attribute.model';
import { initialState, reducer } from './pnl-calculated-attribute.reducer';

import {
  AttemptLoadPnlCalculatedAttributes,
  LoadPnlCalculatedAttributes,
  LoadPnlCalculatedAttributesFailed
} from './pnl-calculated-attribute.actions';

const pnlCalculatedAttribute: PnlCalculatedAttribute = {
  attributeId: 4,
  realizedPnl: 5,
  securityId: 6,
  totalPnl: 7,
  unrealizedPnl: 6.8,
  Analyst: 'A1'
} as any;

describe('PnlCalculatedAttribute Reducer', () => {
  describe('AttemptLoadPnlCalculatedAttributes', () => {
    it('should set the loading state appropriately', () => {
      const action = new AttemptLoadPnlCalculatedAttributes({
        accountId: 1,
        endDate: new Date(),
        startDate: new Date()
      });
      const result = reducer(initialState, action);
      expect(result).toEqual({
        ...initialState,
        loaded: false,
        loading: true
      });
    });
  });
  describe('LoadPnlCalculatedAttributes', () => {
    it('should load the provided pnlAttributes', () => {
      const action = new LoadPnlCalculatedAttributes({
        pnlCalculatedAttributes: [pnlCalculatedAttribute]
      });
      const result = reducer(initialState, action);
      expect(result).toEqual({
        ...initialState,
        loaded: true,
        loading: false,
        pnlCalculatedAttributes: [pnlCalculatedAttribute]
      });
    });
  });
  describe('LoadPnlCalculatedAttributesFailed', () => {
    it('should set the loading state appropriately', () => {
      const error = 'not found';
      const action = new LoadPnlCalculatedAttributesFailed({
        error
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
