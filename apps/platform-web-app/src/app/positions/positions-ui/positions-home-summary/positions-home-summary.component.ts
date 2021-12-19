import { Component, Input } from '@angular/core';
import { TradeWorkflowSpecsBackendStateFacade } from '@pnkl-frontend/shared';
import { PositionsHomeSummary } from '../../positions-ui-state/store/positions-home-summary-selected-account/positions-home-summary.model';

@Component({
  selector: 'positions-home-summary',
  templateUrl: './positions-home-summary.component.html',
  styleUrls: ['./positions-home-summary.component.scss']
})
export class PositionsHomeSummaryComponent {
  @Input() positionsSummary: PositionsHomeSummary;

  constructor(
    public readonly tradeWorkflowSpecsBackendStateFacade: TradeWorkflowSpecsBackendStateFacade
  ) {}
}
