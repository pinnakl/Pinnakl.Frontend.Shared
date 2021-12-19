import { Account } from '@pnkl-frontend/shared';

export interface PnlFilter {
  account: Account;
  assetType?: string;
  endDate: Date;
  startDate: Date;
  viewDiscarded?: boolean;
}
