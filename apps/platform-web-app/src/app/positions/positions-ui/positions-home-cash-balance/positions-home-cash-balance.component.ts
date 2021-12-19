import { Component, Input } from '@angular/core';

export interface CashBalanceUI {
  title: string;
  lmv: number;
  smv: number;
  amount: number;
  total: number;
  baseConvert: number;
  sign: string;
}

@Component({
  selector: 'positions-home-cash-balance',
  templateUrl: './positions-home-cash-balance.component.html',
  styleUrls: ['./positions-home-cash-balance.component.scss']
})
export class PositionsHomeCashBalanceComponent {
  @Input() cashBalance: CashBalanceUI[];
  abs = Math.abs;

  calcTotal(): number {
    return this.cashBalance.reduce((acc, curr) => acc + curr.baseConvert, 0);
  }
}
