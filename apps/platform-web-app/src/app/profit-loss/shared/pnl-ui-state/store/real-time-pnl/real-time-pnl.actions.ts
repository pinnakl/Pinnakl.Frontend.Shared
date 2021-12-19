import { createAction } from '@ngrx/store';

export enum RealTimePnlActionTypes {
  SubscribeToRealTimePnl = '[RealTimePnl] Subscribe RealTimePnl',
  SubscribeToRealTimePricePnl = '[RealTimePnl] Subscribe RealTimePricePnl',
  UnSubscribeToRealTimePnl = '[RealTimePnl] UnSubscribe RealTimePnl',
  UnSubscribeToRealTimePricePnl = '[RealTimePnl] UnSubscribe RealTimePricePnl'
}

export const SubscribeToRealTimePnl = createAction(
  RealTimePnlActionTypes.SubscribeToRealTimePnl
);

export const SubscribeToRealTimePricePnl = createAction(
  RealTimePnlActionTypes.SubscribeToRealTimePricePnl
);

export const UnSubscribeToRealTimePnl = createAction(
  RealTimePnlActionTypes.UnSubscribeToRealTimePnl
);

export const UnSubscribeToRealTimePricePnl = createAction(
  RealTimePnlActionTypes.UnSubscribeToRealTimePricePnl
);
