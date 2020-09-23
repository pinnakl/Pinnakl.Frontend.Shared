// Third party libs
import * as _ from 'lodash';
import * as moment from 'moment';
import { Broker } from '../oms/broker/broker.model';
import { CurrencyForOMS } from '../oms/currency.model';
import { PSET } from '../oms/pset.model';
import { PBAccount } from '../pb-account.model';
import { Security } from '../security/security.model';
import { TradeRequestAllocation } from './trade-request-allocations.model';

export class TradeRequest {
  public accrualPerUnit: number;
  public principal: number;
  public commission: number;
  public currencyId: number;
  public _requestedAllocations: TradeRequestAllocation[];

  constructor(
    public id: number,
    public tradeDate: Date,
    public settleDate: Date,
    public tranType: string,
    public securityMarketId: number,
    public security: Security,
    public trs: boolean,
    public quantity: number,
    public price: number,
    public secFee: number,
    public optionFee: number,
    public accruedInterest: number,
    public netMoneyBook: number,
    public netMoneyLocal: number,
    public currency: CurrencyForOMS,
    public fxRate: number,
    public commissionPerShare: number,
    public broker: Broker,
    public counterparty: PBAccount,
    public pset: PSET,
    public approverMessage: string,
    public allocationsIndicator: boolean,
    public comments: string,
    public customAttribId: number,
    public executionStatus: boolean
  ) {
    if (this.accruedInterest && this.quantity) {
      this.accrualPerUnit = this.accruedInterest / this.quantity;
    }

    if (this.quantity && this.price && this.security.multiplier) {
      this.principal = this.quantity * this.price * this.security.multiplier;
    }

    if (this.quantity && this.commissionPerShare) {
      this.commission = this.quantity * this.commissionPerShare;
    } else {
      this.commission = 0;
    }
  }

  get RequestedAllocations() {
    return this._requestedAllocations;
  }
  set RequestedAllocations(allocations: TradeRequestAllocation[]) {
    this._requestedAllocations = allocations;
  }

  public getTradeDateFormatted(format: string): string {
    return moment(this.tradeDate).format(format);
  }
  public getQuantitySign(): number {
    let sign = 1;
    if (this.tranType) {
      sign = this.tranType.substr(0, 1).toLowerCase() === 'b' ? 1 : -1;
    }
    return sign;
  }

  public getTranTypeLong(): string {
    let ret = '';
    if (this.tranType) {
      if (this.tranType.toLowerCase() === 'b') {
        ret = 'Buy';
      } else if (this.tranType.toLowerCase() === 'bc') {
        ret = 'Buy To Cover';
      } else if (this.tranType.toLowerCase() === 's') {
        ret = 'Sell';
      } else if (this.tranType.toLowerCase() === 'ss') {
        ret = 'Sell Short';
      }
    }

    return ret;
  }
}

export class TradeRequestFromApi {
  constructor(
    public tradeid: string,
    public securityid: string,
    public trantype: string,
    public securitymarketid: string,
    public tradedate: string,
    public settledate: string,
    public assettype: string,
    public trsindicator: string,
    public ticker: string,
    public cusip: string,
    public identifier: string,
    public description: string,
    public quantity: string,
    public price: string,
    public currency: string,
    public fxrate: string,
    public commissiontype: string,
    public commission: string,
    public secfee: string,
    public optionfee: string,
    public accruedinterest: string,
    public netmoneylocal: string,
    public brokername: string,
    public comments: string,
    public allocationsindicator: string,
    public approvermessage: string,
    public psetid: string,
    public counterpartyid: string,
    public privateindicator: string,
    public brokerid: string,
    public allocationid: string,
    public customattribid: string,
    public executionStatus: boolean,
    public currencyid: string
  ) {}
}
