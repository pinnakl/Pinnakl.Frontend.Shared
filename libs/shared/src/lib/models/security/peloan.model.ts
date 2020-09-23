export interface PeLoan {
  accruingIndicator: boolean;
  couponRate: number;
  couponTypeId: number;
  couponType: string;
  firstAccrualDate: Date;
  firstCouponDate: Date;
  id: number;
  interestBasisId: number;
  faceAmount: number;
  maturityDate: Date;
  paymentFrequencyId: number;
  paymentFrequency: string;
  securityId: number;
  creditQuality: string;
  status: string;
  geography: string;
}
