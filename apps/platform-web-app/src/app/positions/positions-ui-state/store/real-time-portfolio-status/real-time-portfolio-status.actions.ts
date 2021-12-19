import { createAction, props } from '@ngrx/store';

export enum RealTimePortfolioStatusActionTypes {
  SubscribeToRealTimePortfolioStatus = '[RealTimePortfolioStatus] Subscribe RealTimePortfolioStatus',
  UnSubscribeToRealTimePortfolioStatus = '[RealTimePortfolioStatus] UnSubscribe RealTimePortfolioStatus'
}


export const SubscribeToRealTimePortfolioStatus = createAction(
  RealTimePortfolioStatusActionTypes.SubscribeToRealTimePortfolioStatus
);

export const UnSubscribeToRealTimePortfolioStatus = createAction(
  RealTimePortfolioStatusActionTypes.UnSubscribeToRealTimePortfolioStatus
);
