import { Action } from '@ngrx/store';

import { PositionsPnlDataField } from '../../positions-pnl-data-fields-backend';

export enum PositionsPnlDataFieldsActionTypes {
  AttemptLoadPositionsPnlDataFields = '[PnlField] Attempt Load PositionsPnlDataFields',
  LoadPositionsPnlDataFields = '[PnlField] Load PositionsPnlDataFields',
  LoadPositionsPnlDataFieldsFailed = '[PnlField] Load PositionsPnlDataFields Failed'
}

export class AttemptLoadPositionsPnlDataFields implements Action {
  readonly type =
    PositionsPnlDataFieldsActionTypes.AttemptLoadPositionsPnlDataFields;
}

export class LoadPositionsPnlDataFields implements Action {
  readonly type = PositionsPnlDataFieldsActionTypes.LoadPositionsPnlDataFields;
  constructor(
    public payload: { positionsPnlDataFields: PositionsPnlDataField[] }
  ) {}
}

export class LoadPositionsPnlDataFieldsFailed implements Action {
  readonly type =
    PositionsPnlDataFieldsActionTypes.LoadPositionsPnlDataFieldsFailed;
  constructor(public payload: { error: any }) {}
}

export type PositionsPnlDataFieldActions =
  | AttemptLoadPositionsPnlDataFields
  | LoadPositionsPnlDataFields
  | LoadPositionsPnlDataFieldsFailed;
