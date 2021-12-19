import { createAction } from '@ngrx/store';

export enum RealTimePriceActionTypes {
  SubscribeToRealTimePrice = '[RealTimePrice] Subscribe RealTimePrice',
  SubscribeToRealTimeGreeks = '[RealTimePrice] Subscribe RealTimeGreeks',
  UnSubscribeToRealTimePrice = '[RealTimePrice] UnSubscribe RealTimePrice'
}


export const SubscribeToRealTimePrice = createAction(
  RealTimePriceActionTypes.SubscribeToRealTimePrice
);

export const SubscribeToRealTimeGreeks = createAction(
  RealTimePriceActionTypes.SubscribeToRealTimeGreeks
);

export const UnSubscribeToRealTimePrice = createAction(
  RealTimePriceActionTypes.UnSubscribeToRealTimePrice
);

export enum DirectionType {
  SHORT = 'short',
  LONG = 'long'
}
