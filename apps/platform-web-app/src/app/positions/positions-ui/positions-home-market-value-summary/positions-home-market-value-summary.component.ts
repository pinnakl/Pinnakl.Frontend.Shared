import { Component, Input } from '@angular/core';
import { MarketValueSummaryElement } from './MarketValueSummary.interface';

@Component({
  selector: 'positions-home-market-value-summary',
  templateUrl: './positions-home-market-value-summary.component.html',
  styleUrls: ['./positions-home-market-value-summary.component.scss']
})
export class PositionsHomeMarketValueSummaryComponent {
  @Input() marketValueSummary: Array<MarketValueSummaryElement>;
  abs = Math.abs;

  constructor() {}

  calcNetLiq(): number {
    return this.marketValueSummary.reduce(
      (acc, value) => value.name === 'Cash' ? acc : acc + value.today,
      0
    );
  }
}
