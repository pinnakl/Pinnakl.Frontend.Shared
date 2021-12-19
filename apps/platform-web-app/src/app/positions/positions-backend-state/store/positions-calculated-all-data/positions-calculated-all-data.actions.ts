import { createAction, props } from '@ngrx/store';

export enum PositionsCalculatedAllDataActionTypes {
  UpdatePositionsCalculatedAllData = '[PositionsCalculatedAllData] Update PositionsCalculatedAllData'
}

export const UpdatePositionsCalculatedAllData = createAction(
  PositionsCalculatedAllDataActionTypes.UpdatePositionsCalculatedAllData,
  props<{ data: any[] }>()
);
