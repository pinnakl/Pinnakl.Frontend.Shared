import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

import { CurrencyForOMS } from '../../../../../models/oms/currency.model';
import { CurrencyActions, CurrencyActionTypes } from './currency.actions';

export interface State extends EntityState<CurrencyForOMS> {
  loaded: boolean;
}

export const adapter: EntityAdapter<CurrencyForOMS> = createEntityAdapter<CurrencyForOMS>();

export const initialState: State = adapter.getInitialState({
  loaded: false
});

export function reducer(
  state: State = initialState,
  action: CurrencyActions
): State {
  switch (action.type) {
    case CurrencyActionTypes.LoadCurrencies: {
      return adapter.addAll(action.payload.currencies, {
        ...state,
        loaded: true
      });
    }

    default: {
      return state;
    }
  }
}

export const { selectAll } = adapter.getSelectors();
export const selectLoaded = (state: State) => state.loaded;
