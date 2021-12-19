import { Component, Input } from '@angular/core';

@Component({
  selector: 'profit-and-loss-summary-item',
  templateUrl: './profit-loss-summary-item.component.html',
  styleUrls: ['../profit-and-loss-summary.component.scss']
})
export class ProfitAndLossSummaryItemComponent {
  @Input() pnlValue: number;
  @Input() pnlText: string;
}
