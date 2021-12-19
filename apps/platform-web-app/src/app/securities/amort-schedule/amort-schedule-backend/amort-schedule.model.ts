export interface AmortSchedule {
  balance: number;
  id: number;
  interest: number;
  payment: number;
  paymentDate: Date;
  peLoanId: number;
  principal: number;
  totalInterest: number;
}
