import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { StockChartModule } from '@progress/kendo-angular-charts';
import {
  ComboBoxModule,
  MultiSelectModule
} from '@progress/kendo-angular-dropdowns';
import { HighchartsChartModule } from 'highcharts-angular';

import { PnklComparisonChartComponent } from './pnkl-comparison-chart';
import { PnklLineChartDateComponent } from './pnkl-line-chart-date';
import { PnklLineChartDateOptionsComponent } from './pnkl-line-chart-date-options';
import { PnklStackbarChartDateComponent } from './pnkl-stackbar-chart-date';
import { PnklTreeMapComponent } from './pnkl-tree-map';

@NgModule({
  declarations: [
    PnklComparisonChartComponent,
    PnklLineChartDateComponent,
    PnklStackbarChartDateComponent,
    PnklLineChartDateOptionsComponent,
    PnklTreeMapComponent
  ],
  imports: [
    ComboBoxModule,
    CommonModule,
    FormsModule,
    HighchartsChartModule,
    MultiSelectModule,
    ReactiveFormsModule,
    StockChartModule
  ],
  exports: [
    PnklLineChartDateComponent,
    PnklStackbarChartDateComponent,
    PnklTreeMapComponent,
    PnklComparisonChartComponent
  ]
})
export class PnklChartsModule {}
