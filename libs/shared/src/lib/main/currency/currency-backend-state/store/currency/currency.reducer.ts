import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';

import { CurrencyForOMS } from '../../../../../models/oms/currency.model';
import { LoadCurrencies } from './currency.actions';

export interface State extends EntityState<CurrencyForOMS> {
  loaded: boolean;
}

export const adapter: EntityAdapter<CurrencyForOMS> = createEntityAdapter<CurrencyForOMS>();

export const initialState: State = adapter.getInitialState({
  loaded: false
});

const featureReducer = createReducer(
  initialState,
  on(LoadCurrencies, (state, { currencies }) => adapter.setAll(currencies, {
    ...state,
    loaded: true
  }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const { selectAll } = adapter.getSelectors();
export const selectLoaded = (state: State) => state.loaded;
