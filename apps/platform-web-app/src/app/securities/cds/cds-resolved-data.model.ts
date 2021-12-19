import { Cds } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';

export class CdsResolvedData {
  constructor(
    public businessDayConvention: string[],
    public businessDaysOptions: string[],
    public cds: Cds,
    public fixedRateDayCount: string[],
    public paymentFrequencyOptions: SecurityAttributeOption[]
  ) {}
}
