import { createAction, props } from '@ngrx/store';

export enum PositionsCalculatedDataActionTypes {
  UpdatePositionsCalculatedData = '[PositionsCalculatedData] Update PositionsCalculatedData'
}


export const UpdatePositionsCalculatedData = createAction(
  PositionsCalculatedDataActionTypes.UpdatePositionsCalculatedData,
  props<{ data: any[] }>()
);
