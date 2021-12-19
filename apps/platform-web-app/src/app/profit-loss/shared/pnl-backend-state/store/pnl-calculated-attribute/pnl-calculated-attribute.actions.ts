import { createAction, props } from '@ngrx/store';

import { PriceStreamModel } from '../../../../../positions/positions-backend/real-time/price-stream/price-stream.model';
import { PnlCalculatedAttribute } from '../../../pnl-backend/pnl-calculated-attribute/pnl-calculated-attribute.model';

export enum PnlCalculatedAttributeActionTypes {
  AttemptLoadPnlCalculatedAttributes = '[PnlCalculatedAttribute] Attempt Load PnlCalculatedAttributes',
  LoadPnlCalculatedAttributes = '[PnlCalculatedAttribute] Load PnlCalculatedAttributes',
  LoadPnlCalculatedAttributesFailed = '[PnlCalculatedAttribute] Load PnlCalculatedAttributes Failed',
  UpdateManyPnlCalculatedAttributes = '[PnlCalculatedAttribute] Update Many PnlCalculatedAttributes',
  UpdateManyPricesPnlCalculatedAttributes = '[PnlCalculatedAttribute] Update Many Prices PnlCalculatedAttributes'
}

export const AttemptLoadPnlCalculatedAttributes = createAction(
  PnlCalculatedAttributeActionTypes.AttemptLoadPnlCalculatedAttributes,
  props<{ accountId: number; endDate: Date; startDate: Date }>()
);

export const LoadPnlCalculatedAttributes = createAction(
  PnlCalculatedAttributeActionTypes.LoadPnlCalculatedAttributes,
  props<{ pnlCalculatedAttributes: PnlCalculatedAttribute[] }>()
);

export const LoadPnlCalculatedAttributesFailed = createAction(
  PnlCalculatedAttributeActionTypes.LoadPnlCalculatedAttributesFailed,
  props<{ error: any }>()
);

export const UpdateManyPnlCalculatedAttributes = createAction(
  PnlCalculatedAttributeActionTypes.UpdateManyPnlCalculatedAttributes,
  props<{ pnlCalculatedAttributes: Partial<PnlCalculatedAttribute>[] }>()
);

export const UpdateManyPricesPnlCalculatedAttributes = createAction(
  PnlCalculatedAttributeActionTypes.UpdateManyPricesPnlCalculatedAttributes,
  props<{ pnlCalculatedAttributes: PriceStreamModel[] }>()
);
