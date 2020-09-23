import { Equity } from '../../models/security/equity.model';

export class EquityServiceStub {
  postEquity(entityToSave: Equity): Promise<Equity> {
    return Promise.resolve(entityToSave);
  }

  putEquity(entityToSave: Equity): Promise<Equity> {
    return Promise.resolve(entityToSave);
  }
}
