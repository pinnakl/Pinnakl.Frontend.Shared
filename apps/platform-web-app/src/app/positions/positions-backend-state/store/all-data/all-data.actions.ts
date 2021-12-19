import { createAction, props } from '@ngrx/store';

export enum PositionsBackendLoadedActionTypes {
  AttemptLoadAllData = '[Positions backend] Attempt load all data',
  SetIsAllDataLoaded = '[Positions backend] Set is all data loaded'
}


export const SetIsAllDataLoaded = createAction(
  PositionsBackendLoadedActionTypes.SetIsAllDataLoaded,
  props<{ payload: boolean }>()
);

export const AttemptLoadAllData = createAction(
  PositionsBackendLoadedActionTypes.AttemptLoadAllData,
  props<{ payload: boolean }>()
);
