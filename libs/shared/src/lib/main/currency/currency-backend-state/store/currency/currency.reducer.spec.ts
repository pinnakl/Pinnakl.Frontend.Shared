import { initialState, reducer } from './currency.reducer';

import { CurrencyForOMS } from '../../../../../models/oms/currency.model';
import { LoadCurrencies } from './currency.actions';

const currencies = getCurrencies();

describe('Currency Reducer', () => {
  describe('LoadCurrencies', () => {
    it('should load the entities and ids and set loaded to true', () => {
      const action = new LoadCurrencies({ currencies });
      const result = reducer(initialState, action);
      expect(result).toEqual({
        ...initialState,
        entities: currencies.reduce(
          (entities, entity) => ({
            ...entities,
            [entity.id]: entity
          }),
          {}
        ),
        ids: currencies.map(e => e.id),
        loaded: true
      });
    });
  });
});

function getCurrencies(): CurrencyForOMS[] {
  return [
    {
      id: 1,
      currency: 'USD'
    },
    {
      id: 2,
      currency: 'AUD'
    }
  ];
}
