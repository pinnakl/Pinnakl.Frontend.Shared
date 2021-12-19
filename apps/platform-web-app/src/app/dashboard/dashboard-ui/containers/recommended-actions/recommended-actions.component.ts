import { Component, Input } from '@angular/core';

import { RecommendedAction } from '../../../dashboard-backend/recommended-actions/recommended-action.model';
import { DashboardStateFacadeService } from '../../../dashboard-ui-state';

@Component({
  selector: 'recommended-actions',
  templateUrl: './recommended-actions.component.html',
  styleUrls: ['recommended-actions.component.scss']
})
export class RecommendedActionsComponent {
  @Input() actions: RecommendedAction[];

  constructor(private dashboardStateFacadeSvc: DashboardStateFacadeService) {}

  onActionClick(action: RecommendedAction): void {
    this.dashboardStateFacadeSvc.processRecommendedAction(action);
  }

  onActionSupressed(action: RecommendedAction): void {
    this.dashboardStateFacadeSvc.supressAction(action);
  }
}
