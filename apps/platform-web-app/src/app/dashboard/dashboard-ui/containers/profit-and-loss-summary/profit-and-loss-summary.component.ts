import { Component, Input, OnInit } from '@angular/core';
import { PnlModel } from '../../../dashboard-backend/dashboard';

@Component({
  selector: 'profit-and-loss-summary',
  templateUrl: './profit-and-loss-summary.component.html',
  styleUrls: ['./profit-and-loss-summary.component.scss']
})
export class ProfitAndLossSummaryComponent implements OnInit {
  @Input() pnlSummary: PnlModel;
  constructor() {}

  ngOnInit() {}
}
