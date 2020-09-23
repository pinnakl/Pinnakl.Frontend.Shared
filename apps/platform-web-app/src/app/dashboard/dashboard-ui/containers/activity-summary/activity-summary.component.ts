import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  PnlExposure,
  PositionEventModel
} from '../../../dashboard-backend/dashboard';
@Component({
  selector: 'activity-summary',
  templateUrl: './activity-summary.component.html',
  styleUrls: ['./activity-summary.component.scss']
})
export class ActivitySummaryComponent implements OnInit {
  @Input() activitySummary: {
    pnlAssetType: PnlExposure[];
    pnlSector: PnlExposure[];
    positionsAdded: PositionEventModel[];
    positionsExited: PositionEventModel[];
  };
  @Output()
  private loadActivitySummary = new EventEmitter();
  constructor() {}

  ngOnInit(): void {}

  refreshActivitySummary(date: { startDate: Date; endDate: Date }): void {
    this.loadActivitySummary.emit(date);
  }
}
