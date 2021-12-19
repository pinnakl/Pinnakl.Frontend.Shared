import { Loan } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';

export class LoanResolvedData {
  constructor(
    public couponTypes: SecurityAttributeOption[],
    public interestBasisOptions: SecurityAttributeOption[],
    public loan: Loan,
    public paymentFrequencyOptions: SecurityAttributeOption[]
  ) {}
}
