import {
  AttemptLoadSelectedCurrency,
  LoadSelectedCurrency,
  LoadSelectedCurrencyFailed
} from './selected-currency.actions';
import { initialState, reducer } from './selected-currency.reducer';

describe('SelectedCurrency Reducer', () => {
  describe('AttemptLoadSelectedCurrency action', () => {
    it('should set loading to true and loaded to false', () => {
      const action = AttemptLoadSelectedCurrency({
        date: new Date(),
        currency: { id: 1, currency: 'usd' }
      });

      const result = reducer(initialState, action);

      expect(result).toEqual({ ...initialState, loaded: false, loading: true });
    });
  });

  describe('LoadSelectedCurrency action', () => {
    it('should populate selected currency and set loading to false and loaded to true', () => {
      const selectedCurrency = { currencyId: 1, fxRate: 1 };
      const action = LoadSelectedCurrency({
        payload: selectedCurrency
      });

      const result = reducer(initialState, action);

      expect(result).toEqual({
        ...initialState,
        loaded: true,
        loading: false,
        selectedCurrency
      });
    });
  });

  describe('LoadSelectedCurrencyFailed action', () => {
    it('should set loading to false and loaded to true', () => {
      const error = 'Test Error';
      const action = LoadSelectedCurrencyFailed({ error });

      const result = reducer(initialState, action);

      expect(result).toEqual({
        ...initialState,
        loaded: false,
        loading: false
      });
    });
  });
});
