import { Currency } from '../../models/security/currency.model';

export class CurrencyServiceStub {
  postCurrency(entityToSave: Currency): Promise<Currency> {
    return Promise.resolve(entityToSave);
  }

  putCurrency(entityToSave: Currency): Promise<Currency> {
    return Promise.resolve(entityToSave);
  }
}
