import { Equity } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';

export class EquityResolvedData {
  constructor(
    public dividendFrequencyOptions: SecurityAttributeOption[],
    public equity: Equity
  ) {}
}
