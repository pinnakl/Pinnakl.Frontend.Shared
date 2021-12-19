import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChartTypes } from '@pnkl-frontend/shared';
import { Account, PositionsPnlDataField } from '@pnkl-frontend/shared';
import {
  DataTypes,
  PnlCalculatedTimeseriesFilter
} from '../../shared/pnl-backend/pnl-calculated-timeseries/pnl-calculated-timeseries-filter.model';
import { PnlCalculatedTimeseries } from '../../shared/pnl-backend/pnl-calculated-timeseries/pnl-calculated-timeseries.model';


@Component({
  selector: 'pnl-calculated-timeseries',
  templateUrl: './pnl-calculated-timeseries.component.html',
  styleUrls: ['./pnl-calculated-timeseries.component.scss']
})
export class PnlCalculatedTimeseriesComponent {
  @Input() accounts: Account[] = [];
  @Input() pnlCalculatedTimeSeries: PnlCalculatedTimeseries[] = [];
  @Input() pnlCalculatedTimeseriesFilter: PnlCalculatedTimeseriesFilter;
  @Input() pnlFields: PositionsPnlDataField[];
  @Output() onFilterChanged = new EventEmitter<PnlCalculatedTimeseriesFilter>();

  hideSelected = false;
  pnlTimeSeriesChartType: ChartTypes = ChartTypes.BAR;

  onDataTypeChanged(dataType: DataTypes): void {
    this.hideSelected = dataType === DataTypes.BY_CATEGORY;
  }
  onChartTypeChanged(chartType: ChartTypes): any {
    this.pnlTimeSeriesChartType = chartType;
  }
}
