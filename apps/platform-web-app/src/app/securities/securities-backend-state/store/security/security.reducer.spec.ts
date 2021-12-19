import { initialState, reducer } from './security.reducer';

import {
  AttemptLoadSecurities,
  LoadSecurities,
  LoadSecuritiesFailed
} from './security.actions';

const security: any = {
  assetType: 'equity',
  assetTypeId: 6,
  countryOfIncorporation: 'USA',
  countryOfRisk: 'USA',
  currency: 'USD',
  currencyId: 21,
  cusip: '829226109',
  dataSourceId: null,
  description: 'Sinclair Broad-a',
  id: 2,
  identifier: () => 'SBGI',
  isin: '',
  isListed: () => true,
  loanId: '',
  manualPricingIndicator: false,
  moodyRating: '',
  multiplier: 1,
  opraCode: '',
  organizationId: null,
  organizationName: null,
  organizationStatusDescription: null,
  organizationStatusId: 'as',
  organizationTicker: 'as',
  privateIndicator: false,
  sandpRating: '',
  securityType: 'equity',
  securityTypeId: 1,
  securityTypeDescription: 'Equity',
  sector: 'Energy',
  sedol: '2799351',
  ticker: 'SBGI',
  principalFactor: 1
};
const securities = [security];

describe('Security Reducer', () => {
  describe('AttemptLoadSecurities', () => {
    it('should set loaded to false and loading to true', () => {
      const action = new AttemptLoadSecurities(),
        result = reducer(initialState, action);
      expect(result).toEqual({
        ...initialState,
        loaded: false,
        loading: true
      });
    });
  });
  describe('LoadSecurities', () => {
    it('should populate entities and ids and should set loaded to true and loading to false', () => {
      const action = new LoadSecurities({ securities: securities }),
        result = reducer(initialState, action);
      expect(result).toEqual({
        loaded: true,
        loading: false,
        entities: { [security.id]: security },
        ids: [security.id]
      });
    });
  });
  describe('LoadSecuritiesFailed', () => {
    it('should set loading to false and loaded to false', () => {
      const action = new LoadSecuritiesFailed({ error: 'test error' }),
        result = reducer(initialState, action);
      expect(result).toEqual({
        ...initialState,
        loaded: false,
        loading: false
      });
    });
  });
});
