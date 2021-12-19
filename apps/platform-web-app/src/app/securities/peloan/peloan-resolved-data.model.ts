import { PeLoan } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';

export interface PeLoanResolvedData {
  peLoan: PeLoan;
  couponTypes: SecurityAttributeOption[];
  interestBasisOptions: SecurityAttributeOption[];
  paymentFrequencyOptions: SecurityAttributeOption[];
}
