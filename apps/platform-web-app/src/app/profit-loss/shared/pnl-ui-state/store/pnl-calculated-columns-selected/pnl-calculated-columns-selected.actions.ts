import { createAction, props } from '@ngrx/store';

export enum PnlCalculatedColumnsSelectedActionTypes {
  AddPnlCalculatedColumnsSelected = '[PnlCalculatedColumnsSelected] Add PnlCalculatedColumnsSelected',
  RemovePnlCalculatedColumnsSelected = '[PnlCalculatedColumnsSelected] Remove PnlCalculatedColumnsSelected'
}

export const AddPnlCalculatedColumnsSelected = createAction(
  PnlCalculatedColumnsSelectedActionTypes.AddPnlCalculatedColumnsSelected,
  props<{ column: string }>()
);

export const RemovePnlCalculatedColumnsSelected = createAction(
  PnlCalculatedColumnsSelectedActionTypes.RemovePnlCalculatedColumnsSelected,
  props<{ column: string }>()
);
