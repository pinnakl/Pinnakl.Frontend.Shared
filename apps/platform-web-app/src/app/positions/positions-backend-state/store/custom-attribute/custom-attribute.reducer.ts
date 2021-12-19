import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { CustomAttribute } from '@pnkl-frontend/shared';
import {
  AttemptLoadCustomAttributes,
  LoadCustomAttributes,
  LoadCustomAttributesFailed
} from './custom-attribute.actions';

export interface State extends EntityState<CustomAttribute> {
  loaded: boolean;
  loading: boolean;
}

export const adapter: EntityAdapter<CustomAttribute> = createEntityAdapter<
  CustomAttribute
>();

export const initialState: State = adapter.getInitialState({
  loaded: false,
  loading: false
});

const featureReducer = createReducer(
  initialState,
  on(AttemptLoadCustomAttributes, (state) => ({ ...state, loaded: false, loading: true })),
  on(LoadCustomAttributes, (state, { customAttributes }) => adapter.setAll(customAttributes, {
    ...state,
    loaded: true,
    loading: false
  })),
  on(LoadCustomAttributesFailed, (state) => ({ ...state, loaded: false, loading: false }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const { selectEntities, selectAll } = adapter.getSelectors();
export const selectLoaded = (state: State) => state.loaded;
