import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChartTypes } from '@pnkl-frontend/shared';
import { PnlCalculatedTimeseries } from '../../shared/pnl-backend/pnl-calculated-timeseries/pnl-calculated-timeseries.model';


@Component({
  selector: 'pnl-calculated-timeseries-chart',
  templateUrl: './pnl-calculated-timeseries-chart.component.html',
  styleUrls: ['./pnl-calculated-timeseries-chart.component.scss']
})
export class PnlCalculatedTimeseriesChartComponent {
  @Input() pnlCalculatedTimeSeries: PnlCalculatedTimeseries[];
  @Input() pnlTimeSeriesChartType: ChartTypes;
  @Input() hideSelected = false;
  @Output() onChartTypeChanged = new EventEmitter<ChartTypes>();

  get isLine(): boolean {
    return this.pnlTimeSeriesChartType === ChartTypes.LINE;
  }

  constructor() {}

  onTypeChanged(event: ChartTypes): void {
    this.onChartTypeChanged.emit(event);
  }
}
