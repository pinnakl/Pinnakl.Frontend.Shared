import { Component, Input, OnInit } from '@angular/core';

import { DashboardMarketMacroStat } from '../../../dashboard-backend';
import { chain } from 'lodash';

@Component({
  selector: 'dashboard-market-macro-stats',
  templateUrl: './dashboard-market-macro-stats.component.html',
  styleUrls: ['./dashboard-market-macro-stats.component.scss']
})
export class DashboardMarketMacroStatsComponent implements OnInit {
  @Input() stats: DashboardMarketMacroStat[] = [];
  get statsByType(): DashboardMarketMacroStat[][] {
    return chain(this.stats)
      .orderBy(['type'])
      .groupBy(stat => stat.type)
      .values()
      .value();
  }
  constructor() {}

  ngOnInit(): void {}

  getType([stat]: DashboardMarketMacroStat[]): string {
    return stat ? stat.type : '';
  }
}
