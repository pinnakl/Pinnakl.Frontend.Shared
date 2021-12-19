import { createAction, props } from '@ngrx/store';
import { PositionsPnlValueModel } from '@pnkl-frontend/shared';

export enum PositionsPnlValuesActionsTypes {
  InitializePnlValues = '[PositionsPnlValues] Initialize pnl values',
  AddPnlValue = '[PositionsPnlValues] Add pnl value'
}


export const InitializePnlValues = createAction(
  PositionsPnlValuesActionsTypes.InitializePnlValues,
  props<{ payload: PositionsPnlValueModel[], accountId: number }>()
);


export const AddPnlValue = createAction(
  PositionsPnlValuesActionsTypes.AddPnlValue,
  props<{ payload: PositionsPnlValueModel[] }>()
);
