import { NgModule } from '@angular/core';

import { TooltipModule } from '@progress/kendo-angular-tooltip';

import { PnklTooltipComponent } from './pnkl-tooltip';
import { PnklTooltipService } from './pnkl-tooltip.service';

@NgModule({
  imports: [TooltipModule],
  exports: [PnklTooltipComponent, TooltipModule],
  providers: [PnklTooltipService],
  declarations: [PnklTooltipComponent]
})
export class PnklTooltipModule {}
