import { Component, Input, OnInit } from '@angular/core';

import { DashboardMarketMacroStat } from '../../../dashboard-backend';

@Component({
  selector: 'dashboard-market-macro-stats-by-type',
  templateUrl: './dashboard-market-macro-stats-by-type.component.html',
  styleUrls: ['./dashboard-market-macro-stats-by-type.component.scss']
})
export class DashboardMarketMacroStatsByTypeComponent implements OnInit {
  @Input() stats: DashboardMarketMacroStat[] = [];

  get isIndex(): boolean {
    return this.stats[0].type === 'index';
  }

  get statType(): string {
    return this.isIndex ? 'INDICES' : 'MACRO STATS';
  }
  constructor() {}

  ngOnInit(): void {}

  getName({ name }: DashboardMarketMacroStat): string {
    return name;
  }
}
