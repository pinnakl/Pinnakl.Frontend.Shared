import { Component, Input } from '@angular/core';
import { DashboardMarketMacroStat } from '../../../dashboard-backend/dashboard-market-macro-stat/dashboard-market-macro-stat.model';

@Component({
  selector: 'dashboard-market-macro-stats-by-type',
  templateUrl: './dashboard-market-macro-stats-by-type.component.html',
  styleUrls: ['./dashboard-market-macro-stats-by-type.component.scss']
})
export class DashboardMarketMacroStatsByTypeComponent {
  @Input() stats: DashboardMarketMacroStat[] = [];

  get isIndex(): boolean {
    return this.stats[0].type === 'index';
  }

  get statType(): string {
    return this.isIndex ? 'INDICES' : 'MACRO STATS';
  }

  getName({ name }: DashboardMarketMacroStat): string {
    return name;
  }
}
