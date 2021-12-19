import { NgModule } from '@angular/core';

import { SharedModule } from '@pnkl-frontend/shared';
import { PositionsReportDataService } from './positions-report-data/positions-report-data.service';
import { PositionsReportInfoService } from './positions-report-info/positions-report-info.service';
import { PortfolioStatusStreamService } from './real-time/portfolio-status-stream/portfolio-status-stream.service';
import { PriceStreamService } from './real-time/price-stream/price-stream.service';

@NgModule({
  imports: [SharedModule],
  providers: [
    PositionsReportDataService,
    PositionsReportInfoService,
    PriceStreamService,
    PortfolioStatusStreamService
  ]
})
export class PositionsBackendModule {}
