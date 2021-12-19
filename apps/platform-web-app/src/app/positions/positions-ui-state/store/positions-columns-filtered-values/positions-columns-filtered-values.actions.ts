import { createAction, props } from '@ngrx/store';

export enum PositionsColumnsFilteredValuesActionTypes {
  UpdatePositionsColumnsFilteredValues = '[PositionsColumnsFilteredValues] Update PositionsColumnsFilteredValues'
}


export const UpdatePositionsColumnsFilteredValues = createAction(
  PositionsColumnsFilteredValuesActionTypes.UpdatePositionsColumnsFilteredValues,
  props<{ valuesHashMap: { [key: string]: number[] }; }>()
);
