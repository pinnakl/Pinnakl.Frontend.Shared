import { SecurityMarket } from '../../models/security/security-market.model';

export class MarketServiceStub {
  postSecurityMarket(entityToSave: SecurityMarket): Promise<SecurityMarket> {
    return Promise.resolve(entityToSave);
  }
}
