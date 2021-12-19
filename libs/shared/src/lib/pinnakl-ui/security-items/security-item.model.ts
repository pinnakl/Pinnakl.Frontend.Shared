import { SecurityMarketFlattened } from '../../models/security/security-market-flattened.model';

export interface SecurityItem extends SecurityMarketFlattened {
  color: string;
  searchString: string;
}
