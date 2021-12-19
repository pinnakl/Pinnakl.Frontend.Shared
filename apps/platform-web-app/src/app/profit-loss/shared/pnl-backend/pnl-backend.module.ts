import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PnlCalculatedAttributeService } from './pnl-calculated-attribute/pnl-calculated-attribute.service';
import { PnlCalculatedTimeseriesService } from './pnl-calculated-timeseries/pnl-calculated-timeseries.service';

@NgModule({
  imports: [CommonModule],
  declarations: [],
  providers: [PnlCalculatedAttributeService, PnlCalculatedTimeseriesService]
})
export class PnlBackendModule {}
