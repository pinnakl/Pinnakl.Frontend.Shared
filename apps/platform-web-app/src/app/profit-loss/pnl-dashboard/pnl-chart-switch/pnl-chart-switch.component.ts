import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChartTypes } from '@pnkl-frontend/shared';

@Component({
  selector: 'pnl-chart-switch',
  templateUrl: './pnl-chart-switch.component.html',
  styleUrls: ['./pnl-chart-switch.component.scss']
})
export class PnlChartSwitchComponent {
  @Input() chartType: ChartTypes;
  @Output() onChartTypeChanged = new EventEmitter<ChartTypes>();
  public chartTypes: typeof ChartTypes = ChartTypes;

  change(type: ChartTypes): void {
    this.onChartTypeChanged.emit(<ChartTypes>type);
  }
}
