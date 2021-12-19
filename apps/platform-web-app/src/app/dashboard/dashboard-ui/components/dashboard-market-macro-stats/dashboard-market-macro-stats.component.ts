import { Component, Input } from '@angular/core';

import { chain } from 'lodash';
import { DashboardMarketMacroStat } from '../../../dashboard-backend/dashboard-market-macro-stat/dashboard-market-macro-stat.model';

@Component({
  selector: 'dashboard-market-macro-stats',
  templateUrl: './dashboard-market-macro-stats.component.html',
  styleUrls: ['./dashboard-market-macro-stats.component.scss']
})
export class DashboardMarketMacroStatsComponent {
  @Input() stats: DashboardMarketMacroStat[] = [];
  get statsByType(): DashboardMarketMacroStat[][] {
    return chain(this.stats)
      .orderBy(['type'])
      .groupBy(stat => stat.type)
      .values()
      .value();
  }

  getType([stat]: DashboardMarketMacroStat[]): string {
    return stat ? stat.type : '';
  }
}
