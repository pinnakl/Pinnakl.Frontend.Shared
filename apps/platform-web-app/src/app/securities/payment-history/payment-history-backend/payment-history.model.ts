export interface PaymentHistory {
  id: number;
  peLoanId: number;
  paymentDate: Date;
  payment: number;
  principal: number;
  interest: number;
}
