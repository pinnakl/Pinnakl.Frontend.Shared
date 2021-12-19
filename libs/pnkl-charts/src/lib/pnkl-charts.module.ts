import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { StockChartModule, ChartsModule } from '@progress/kendo-angular-charts';
import {
  ComboBoxModule,
  MultiSelectModule
} from '@progress/kendo-angular-dropdowns';
import { AgGridModule } from 'ag-grid-angular';
import { HighchartsChartModule } from 'highcharts-angular';

import { PnklComparisonChartComponent } from './pnkl-comparison-chart';
import { PnklLineChartDateComponent } from './pnkl-line-chart-date';
import { PnklLineStockchartDateComponent } from './pnkl-line-stockchart-date';
import { PnklLineStockchartDateOptionsComponent } from './pnkl-line-stockchart-date-options';
import { PnklStackbarChartDateComponent } from './pnkl-stackbar-chart-date';
import { PnklTreeMapComponent } from './pnkl-tree-map';

@NgModule({
  declarations: [
    PnklComparisonChartComponent,
    PnklLineStockchartDateComponent,
    PnklStackbarChartDateComponent,
    PnklLineChartDateComponent,
    PnklLineStockchartDateOptionsComponent,
    PnklTreeMapComponent
  ],
  imports: [
    ComboBoxModule,
    CommonModule,
    FormsModule,
    HighchartsChartModule,
    MultiSelectModule,
    ReactiveFormsModule,
    StockChartModule,
    AgGridModule,
    ChartsModule
  ],
  exports: [
    PnklLineStockchartDateComponent,
    PnklStackbarChartDateComponent,
    PnklTreeMapComponent,
    PnklComparisonChartComponent,
    PnklLineChartDateComponent
  ]
})
export class PnklChartsModule {}
