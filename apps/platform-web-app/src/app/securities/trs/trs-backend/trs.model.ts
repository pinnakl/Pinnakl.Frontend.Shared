import { Security } from '@pnkl-frontend/shared';

export class TRS {
  public underlyingSecurity: Security;
  constructor(
    public id: number,
    public securityId: number,
    public startDate: Date,
    public effectiveDate: Date,
    public terminationDate: Date,
    public baseRate: number,
    public spread: number,
    public dayCount: string,
    public swapRefNo: string,
    public resetIndicator: string,
    public underlyingSecurityId: number
  ) {}
}
