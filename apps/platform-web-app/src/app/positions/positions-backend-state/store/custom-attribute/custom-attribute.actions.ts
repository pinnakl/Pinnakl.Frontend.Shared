import { createAction, props } from '@ngrx/store';
import { CustomAttribute } from '@pnkl-frontend/shared';

export enum CustomAttributeActionTypes {
  AttemptLoadCustomAttributes = '[CustomAttribute] Attempt Load CustomAttributes',
  LoadCustomAttributes = '[CustomAttribute] Load CustomAttributes',
  LoadCustomAttributesFailed = '[CustomAttribute] Load CustomAttributes Failed'
}


export const AttemptLoadCustomAttributes = createAction(
  CustomAttributeActionTypes.AttemptLoadCustomAttributes
);

export const LoadCustomAttributes = createAction(
  CustomAttributeActionTypes.LoadCustomAttributes,
  props<{ customAttributes: CustomAttribute[] }>()
);

export const LoadCustomAttributesFailed = createAction(
  CustomAttributeActionTypes.LoadCustomAttributesFailed,
  props<{ error: any }>()
);
