import { Preferred } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';

export class PreferredResolvedData {
  constructor(
    public dividendFrequencyOptions: SecurityAttributeOption[],
    public preferred: Preferred
  ) {}
}
