import { createAction, props } from '@ngrx/store';

export enum PnlFieldsSelectedActionTypes {
  RemoveField = '[PnlFieldsSelected] Remove Field',
  SelectFields = '[PnlFieldsSelected] SelectFields',
  SelectInitialFields = '[PnlFieldsSelected] SelectInitialFields'
}


export const RemoveField = createAction(
  PnlFieldsSelectedActionTypes.RemoveField,
  props<{ id: number }>()
);

export const SelectFields = createAction(
  PnlFieldsSelectedActionTypes.SelectFields,
  props<{ ids: number[] }>()
);

export const SelectInitialFields = createAction(
  PnlFieldsSelectedActionTypes.SelectInitialFields,
  props<{ ids: number[] }>()
);
