import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TradeWorkflowSpecService } from './trade-workflow-spec.service';

@NgModule({
  imports: [CommonModule],
  providers: [TradeWorkflowSpecService]
})
export class TradeWorkflowSpecsBackendModule {}
