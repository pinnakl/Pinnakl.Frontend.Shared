import { CurrencyForOMS, CurrencyForOMSFromApi } from './currency.model';

export class TradingCurrency extends CurrencyForOMS {
  constructor(public id: number, public g_id: number, public currency: string) {
    super(id, currency);
  }
}

export class TradingCurrencyFromApi extends CurrencyForOMSFromApi {
  constructor(public id: string, public g_id: string, public currency: string) {
    super(id, currency);
  }
}
