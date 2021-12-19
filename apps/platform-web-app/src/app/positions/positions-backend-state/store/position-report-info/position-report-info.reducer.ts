import { Action, createReducer, on } from '@ngrx/store';
import {
  AttemptLoadPositionReportInfo,
  LoadPositionReportInfo,
  LoadPositionReportInfoFailed
} from './position-report-info.actions';

export interface State {
  loaded: boolean;
  loading: boolean;
}

export const initialState: State = { loaded: false, loading: false };

const featureReducer = createReducer(
  initialState,
  on(AttemptLoadPositionReportInfo, (state) => ({ ...state, loading: true, loaded: false })),
  on(LoadPositionReportInfo, (state) => ({ ...state, loading: false, loaded: true })),
  on(LoadPositionReportInfoFailed, (state) => ({ ...state, loading: false, loaded: false }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const selectLoaded = (state: State) => state.loaded;
