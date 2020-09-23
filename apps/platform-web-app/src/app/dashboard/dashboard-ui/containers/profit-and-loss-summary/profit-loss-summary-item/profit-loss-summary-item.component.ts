import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'profit-and-loss-summary-item',
  templateUrl: './profit-loss-summary-item.component.html',
  styleUrls: ['../profit-and-loss-summary.component.scss']
})
export class ProfitAndLossSummaryItemComponent implements OnInit {
  @Input() pnlValue: number;
  @Input() pnlText: string;
  constructor() {}

  ngOnInit(): void {}
}
