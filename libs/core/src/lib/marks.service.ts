import { Injectable } from '@angular/core';
import { WebServiceProvider } from './web-service-provider.service';

@Injectable()
export class MarksService {
  private readonly _pricesLatestMark = 'entities/prices_latest_mark';
  constructor(private readonly _wsp: WebServiceProvider) {}

  public getAllPricesLatestMark(): Promise<{
    price: number,
    securityId: number
  }[]> {
    return this._wsp.getHttp<{
      price: string,
      securityid: string,
      priceType: string
    }[]>({ endpoint: this._pricesLatestMark })
      .then(items =>
        items
          .filter(i => i.priceType === 'mid')
          .map(({ price, securityid }) => ({ price: parseFloat(price), securityId: parseInt(securityid, 10) })));
  }
}
