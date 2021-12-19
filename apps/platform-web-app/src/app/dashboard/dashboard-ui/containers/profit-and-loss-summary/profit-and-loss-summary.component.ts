import { Component, Input } from '@angular/core';
import { PnlModel } from '../../../dashboard-backend/dashboard/pnl.model';

@Component({
  selector: 'profit-and-loss-summary',
  templateUrl: './profit-and-loss-summary.component.html',
  styleUrls: ['./profit-and-loss-summary.component.scss']
})
export class ProfitAndLossSummaryComponent {
  @Input() pnlSummary: PnlModel;
}
