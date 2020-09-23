import * as moment from 'moment';

export class SecurityPriceAlertPayload {
  constructor(
    public securityId: number,
    public priceType: string,
    public condition: string,
    public status: string,
    public price: number,
    public createDateTime: Date
  ) {}
}

export class SecurityPriceAlert {
  public id: string;
  public assettype: string;
  public condition: string;
  public createdatetime: string;
  public price: string;
  public pricetype: string;
  public securityid: string;
  public status: string;
  public ticker: string;
  public currentPrice?: number;
  public createdLocalDate?: Date;
  constructor(data: Partial<SecurityPriceAlert>) {
    data.createdLocalDate = moment.utc(data.createdatetime, 'MM/DD/YYYY hh:mm:ss a').toDate();
    Object.assign(this, data);
  }
}

export class WatchlistItem {
  public id: string;
  public createdatetime: string;
  public securityid: string;
  public ticker: string;
  public lastPrice?: number;
  public netchange?: number;
  public low?: number;
  public high?: number;
  public createdLocalDate?: Date;
  constructor(data: Partial<WatchlistItem>) {
    data.createdLocalDate = moment.utc(data.createdatetime, 'MM/DD/YYYY hh:mm:ss a').toDate();
    Object.assign(this, data);
  }
}
