import { Broker, InternalOrdStatus, OrderTIF, OrderType } from './oms';
import { Security } from './security';

export interface RebalanceOrderModel {
  accountCodes: [{ accountId: number, quantity: number }];
  assetType: string;
  brokerId: number;
  brokerName: string;
  broker: Broker;
  commission: number;
  isPositiveQuantity: boolean;
  orderPrice: number;
  orderQuantity: number;
  orderStatus: InternalOrdStatus;
  position: number;
  securityId: number;
  ticker: string;
  tif: OrderTIF;
  tradeCost: number;
  tradeDate: string;
  tranType: string;
  type: OrderType;
  selected: boolean;
  security: Security;
}
