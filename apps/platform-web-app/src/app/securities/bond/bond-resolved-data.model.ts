import { Bond } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';

export class BondResolvedData {
  constructor(
    public bond: Bond,
    public couponTypes: SecurityAttributeOption[],
    public interestBasisOptions: SecurityAttributeOption[],
    public paymentFrequencyOptions: SecurityAttributeOption[]
  ) {}
}
