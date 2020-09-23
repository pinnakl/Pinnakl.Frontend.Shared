import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

import { PositionsPnlDataField } from '../../positions-pnl-data-fields-backend';
import {
  PositionsPnlDataFieldActions,
  PositionsPnlDataFieldsActionTypes
} from './positions-pnl-data-fields.actions';

export interface State extends EntityState<PositionsPnlDataField> {
  loaded: boolean;
  loading: boolean;
}

export const adapter: EntityAdapter<
  PositionsPnlDataField
> = createEntityAdapter<PositionsPnlDataField>();

export const initialState: State = adapter.getInitialState({
  loaded: false,
  loading: false
});

export function reducer(
  state: State = initialState,
  action: PositionsPnlDataFieldActions
): State {
  switch (action.type) {
    case PositionsPnlDataFieldsActionTypes.AttemptLoadPositionsPnlDataFields: {
      return {
        ...state,
        loaded: false,
        loading: true
      };
    }
    case PositionsPnlDataFieldsActionTypes.LoadPositionsPnlDataFields: {
      return adapter.addAll(action.payload.positionsPnlDataFields, {
        ...state,
        loaded: true,
        loading: false
      });
    }
    case PositionsPnlDataFieldsActionTypes.LoadPositionsPnlDataFieldsFailed: {
      return {
        ...state,
        loaded: false,
        loading: false
      };
    }
    default: {
      return state;
    }
  }
}

export const { selectAll } = adapter.getSelectors();
export const selectLoaded = (state: State) => state.loaded;
