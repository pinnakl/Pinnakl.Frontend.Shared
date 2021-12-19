import { formatDate } from '@angular/common';
import {
  Broker,
  CurrencyForOMS,
  ExecutionReport,
  ExecutionReportFromApi,
  OptInType,
  PostMultiPassive,
  Security,
  StrategyType,
  UrgencyType
} from '@pnkl-frontend/shared';
import * as _ from 'lodash';

export type OrderAction = 'NEW' | 'CANCEL/REPLACE' | 'CANCEL' | 'STAGE';
export type InternalOrdStatus = 'STAGED' | 'PLACED';
export type OrderType = 'MKT' | 'LMT' | 'STOP';
export type OrderTIF = 'DAY' | 'GTC';
export type OrderStatus =
  | 'STAGED'
  | 'PARTIALLY_FILLED'
  | 'FILLED'
  | 'REJECTED'
  | 'UNKNOWN';

export type ExecType =
  | 'New'
  | 'Partial fill'
  | 'Filled'
  | 'Done for day'
  | 'Canceled'
  | 'Replaced'
  | 'Pending Cancel'
  | 'Stopped'
  | 'Rejected'
  | 'Suspended'
  | 'Pending New'
  | 'Calculated'
  | 'Expired'
  | 'Restated'
  | 'Pending Replace';

export type OrdStatus =
  | 'New'
  | 'PartialFill'
  | 'Filled'
  | 'DoneForDay'
  | 'Canceled'
  | 'Replaced'
  | 'PendingCancel'
  | 'Stopped'
  | 'Rejected'
  | 'Suspended'
  | 'PendingNew'
  | 'Calculated'
  | 'Expired'
  | 'Restated'
  | 'PendingReplace';

export const SSE_MSG_TYP = {
  0: 'HEALTH',
  1: 'PLACEMENT',
  2: 'EXECUTIONREPORT',
  3: 'ORDERBOOK'
};

const rejectedStatus: OrdStatus[] = ['Rejected'];
const ackStatus: OrdStatus[] = ['New', 'Replaced', 'Canceled'];
const pendingStatus: OrdStatus[] = [
  'PendingNew',
  'PendingReplace',
  'PendingCancel'
];
const filledStatus: OrdStatus[] = ['PartialFill', 'Filled'];

export class Placement {
  public strategyParams: StrategyParams;
  constructor(
    public id: number,
    public parentOrderId: number,
    public action: string,
    public timestamp: Date,
    public quantity: number,
    public orderType: OrderType,
    public tif: OrderTIF,
    public limitPrice: number,
    public stopPrice: number,
    public executionReports: ExecutionReport[]
  ) {}

  private getAckERs(): ExecutionReport[] {
    const ackERs = _.filter(this.executionReports, function (o): boolean {
      if (
        rejectedStatus.includes(<OrdStatus>o.execType) === true ||
        pendingStatus.includes(<OrdStatus>o.execType) === true ||
        ackStatus.includes(<OrdStatus>o.execType) === true ||
        o.msgType === '9'
      ) {
        return true;
      } else {
        return false;
      }
    });

    return ackERs;
  }
  public getAckStatus(): string {
    const relevantERs = this.getAckERs();

    if (relevantERs.length === 0) {
      return 'Unknown';
    }
    const er = _.sortBy(relevantERs, 'id').reverse();

    const status: OrdStatus = <OrdStatus>er[0].orderStatus;
    if (er[0].msgType === '9' || rejectedStatus.includes(status)) {
      return 'Rejected';
    } else if (pendingStatus.includes(status)) {
      return 'Pending';
    } else if (ackStatus.includes(status)) {
      return 'Ack';
    } else {
      return 'Unknown';
    }
  }

  public getAllFills(): ExecutionReport[] {
    let ers: ExecutionReport[];
    ers = this.executionReports.reduce((a, b) => a.concat(b), []);

    const fills = _.filter(ers, function (o): boolean {
      return (
        ackStatus.includes(<OrdStatus>o.execType) === false &&
        pendingStatus.includes(<OrdStatus>o.execType) === false &&
        rejectedStatus.includes(<OrdStatus>o.execType) === false &&
        o.msgType !== '9'
      );
    });
    return fills;
  }
}

export class PlacementFromApi {
  constructor(
    public Id: string,
    public ParentOrderId: string,
    public Action: string,
    public Timestamp: string,
    public OrderQty: string,
    public OrderType: string,
    public TIF: string,
    public LimitPrice: string,
    public StopPrice: string,
    public ers: ExecutionReportFromApi[],
    public StrategyParams: StrategyParams
  ) {}
}

export interface StrategyParams {
  strategy: StrategyType;
  startDate: any;
  endDate: any;
  displayQty: number;
  optIn: OptInType;
  urgency: UrgencyType;
  maxVolume: number;
  minQty: number;
  maxTheoOffset: number;
  postMultiPassive: PostMultiPassive;
}

export class Order {
  public mark: number;
  public dateInMilliseconds: string;
  public strategyParams: StrategyParams;
  public traderText: string;
  constructor(
    public id: number,
    public _tradeDate: Date,
    public tranType: string,
    public security: Security,
    public securitySecondary: Security,
    public quantity: number,
    public type: OrderType,
    public tif: OrderTIF,
    public stopPrice: number,
    public limitPrice: number,
    public currency: CurrencyForOMS,
    public broker: Broker,
    public approverMessage: string,
    public placements: Placement[],
    public internalStatus: InternalOrdStatus,
    public name: string
  ) {
    this.dateInMilliseconds = _tradeDate.getTime().toString();
  }

  public set tradeDate(newDate: Date) {
    this._tradeDate = newDate;
    this.dateInMilliseconds = newDate.getTime().toString();
  }

  public getAllAcceptedMessages(): ExecutionReport[] {
    let ers: ExecutionReport[];
    ers = this.getAllERs();

    const fills = _.filter(ers, function (er): boolean {
      return (
        pendingStatus.includes(<OrdStatus>er.execType) === false &&
        rejectedStatus.includes(<OrdStatus>er.execType) === false &&
        er.msgType !== '9'
      );
    });
    return fills;
  }

  public getAllERs(): ExecutionReport[] {
    let ers: ExecutionReport[];
    ers = this.placements
      .map(q => q.executionReports)
      .reduce((a, b) => a.concat(b), []);
    return ers;
  }

  public avgFillPrice(): number {
    const fills = this.getAllAcceptedMessages();
    const sortedFills = _.sortBy(fills, 'id').reverse();
    return sortedFills.length > 0 ? sortedFills[0].avgPrc : 0;
  }

  public acceptedOrderQty(): number {
    const ers: ExecutionReport[] = this.getAllAcceptedMessages();
    const sortedERs = _.sortBy(ers, 'id').reverse();
    return sortedERs.length > 0 ? sortedERs[0].orderQty : this.quantity;
  }

  public filledQty(): number {
    const ers: ExecutionReport[] = this.getAllAcceptedMessages();
    const sortedERs = _.sortBy(ers, 'id').reverse();
    return sortedERs.length > 0 ? sortedERs[0].cumQty : 0;
  }

  public leavesQty(): number {
    const ers: ExecutionReport[] = this.getAllAcceptedMessages();
    const sortedERs = _.sortBy(ers, 'id').reverse();
    return sortedERs.length > 0 ? sortedERs[0].leftQty : this.quantity;
  }

  public status(): string {
    if (this.internalStatus === 'STAGED') {
      if (!this.id) {
        return 'Draft';
      } else {
        return 'Staged';
      }
    } else {
      const executionReports = this.getAllERs();
      if (executionReports.length > 0) {
        const sortERDesc = _.sortBy(executionReports, 'id').reverse();
        return sortERDesc[0].orderStatus;
      } else if (this.placements.length > 0) {
        return 'Placed';
      } else if (this.id) {
        return 'Placement Pending';
      } else {
        return 'Draft';
      }
    }
  }

  public hasBeenPlaced(): boolean {
    return this.placements && this.placements.length > 0;
  }

  public get ticker(): string {
    return this.securitySecondary == null
      ? this.security.ticker
      : `${this.security.ticker}/${this.securitySecondary.ticker}`;
  }

  public get description(): string {
    return this.securitySecondary == null
      ? this.security.description
      : `${this.security.description}/${this.securitySecondary.description}`;
  }

  public get formattedTradeDate(): string | Date {
    try {
      return formatDate(this._tradeDate, 'MM/dd/y h:mm a', 'en-US');
    } catch (e) {
      return this._tradeDate;
    }
  }

  public get longTranType(): string {
    let ret = '';
    if (this.tranType) {
      if (this.tranType.toLowerCase() === 'b') {
        ret = 'Buy';
      } else if (this.tranType.toLowerCase() === 'bc') {
        ret = 'Cover';
      } else if (this.tranType.toLowerCase() === 's') {
        ret = 'Sell';
      } else if (this.tranType.toLowerCase() === 'ss') {
        ret = 'Short';
      }
    }

    return ret;
  }
}

export class OrderFromAPI {
  constructor(
    public id: string,
    public tradedate: string,
    public trtype: string,
    public securityid: string,
    public securityidsecondary: string,
    public quantity: string,
    public type: string,
    public tif: string,
    public stopprice: number,
    public limitprice: number,
    public fillquantity: number,
    public fillprice: number,
    public currency: string,
    public brokerid: string,
    public approvermessage: string,
    public orderstatus: string,
    public ers: ExecutionReportFromApi[],
    public placements: PlacementFromApi[],
    public name: string,
    public tradertext: string
  ) {}
}

export class OrderDispatch {
  constructor(public action: OrderAction, public order: Order) {}
}
