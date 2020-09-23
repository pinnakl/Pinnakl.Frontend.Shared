import {
  Broker,
  CurrencyForOMS,
  ExecutionReport,
  ExecutionReportFromApi,
  Security
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
        rejectedStatus.includes(<OrdStatus>o.orderStatus) === true ||
        pendingStatus.includes(<OrdStatus>o.orderStatus) === true ||
        ackStatus.includes(<OrdStatus>o.orderStatus) === true
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
    if (rejectedStatus.includes(status)) {
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
      return filledStatus.includes(<OrdStatus>o.orderStatus) === true;
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
    public ers: ExecutionReportFromApi[]
  ) {}
}

export class Order {
  constructor(
    public id: number,
    public tradeDate: Date,
    public tranType: string,
    public security: Security,
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
  ) {}

  public getAllFills(): ExecutionReport[] {
    let ers: ExecutionReport[];
    ers = this.getAllERs();

    const fills = _.filter(ers, function (o): boolean {
      return filledStatus.includes(<OrdStatus>o.orderStatus) === true;
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
    const fills = this.getAllFills();
    const sortedFills = _.sortBy(fills, 'id').reverse();
    return sortedFills.length > 0 ? sortedFills[0].avgPrc : 0;
  }

  public filledQty(): number {
    const fills = this.getAllFills();

    const totFilled = _.sumBy(fills, 'lastQty');
    return totFilled;
    //const sortedFills = _.sortBy(fills, 'id').reverse();
    //return sortedFills.length > 0 ? sortedFills[0].cumQty : 0;
  }

  public remainingQty(): number {
    return this.quantity - this.filledQty();
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
}

export class OrderFromAPI {
  constructor(
    public id: string,
    public tradedate: string,
    public trtype: string,
    public securityid: string,
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
    public name: string
  ) {}
}

export class OrderDispatch {
  constructor(public action: OrderAction, public order: Order) {}
}
