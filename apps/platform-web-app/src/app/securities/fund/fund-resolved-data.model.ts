import { Fund } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';

export class FundResolvedData {
  constructor(
    public dividendFrequencyOptions: SecurityAttributeOption[],
    public fund: Fund
  ) {}
}
