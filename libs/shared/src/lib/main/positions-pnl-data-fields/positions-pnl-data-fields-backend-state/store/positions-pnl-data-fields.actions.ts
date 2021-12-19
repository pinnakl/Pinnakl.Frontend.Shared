import { createAction, props } from '@ngrx/store';

import { PositionsPnlDataField } from '../../positions-pnl-data-fields-backend';

export enum PositionsPnlDataFieldsActionTypes {
  AttemptLoadPositionsPnlDataFields = '[PnlField] Attempt Load PositionsPnlDataFields',
  LoadPositionsPnlDataFields = '[PnlField] Load PositionsPnlDataFields',
  LoadPositionsPnlDataFieldsFailed = '[PnlField] Load PositionsPnlDataFields Failed'
}

export const AttemptLoadPositionsPnlDataFields = createAction(
  PositionsPnlDataFieldsActionTypes.AttemptLoadPositionsPnlDataFields
);

export const LoadPositionsPnlDataFields = createAction(
  PositionsPnlDataFieldsActionTypes.LoadPositionsPnlDataFields,
  props<{ positionsPnlDataFields: PositionsPnlDataField[] }>()
);

export const LoadPositionsPnlDataFieldsFailed = createAction(
  PositionsPnlDataFieldsActionTypes.LoadPositionsPnlDataFieldsFailed,
  props<{ error: any }>()
);
