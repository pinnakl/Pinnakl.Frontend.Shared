import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PnlExposure } from '../../../dashboard-backend/dashboard/pnl-exposure.model';
import { PositionEventModel } from '../../../dashboard-backend/dashboard/position-event.model';

@Component({
  selector: 'activity-summary',
  templateUrl: './activity-summary.component.html',
  styleUrls: ['./activity-summary.component.scss']
})
export class ActivitySummaryComponent {
  @Input() activitySummary: {
    pnlAssetType: PnlExposure[];
    pnlSector: PnlExposure[];
    positionsAdded: PositionEventModel[];
    positionsExited: PositionEventModel[];
  };
  @Output()
  private loadActivitySummary = new EventEmitter();

  refreshActivitySummary(date: { startDate: Date; endDate: Date }): void {
    this.loadActivitySummary.emit(date);
  }
}
