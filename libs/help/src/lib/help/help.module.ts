import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from '@progress/kendo-angular-dialog';
import {SharedModule} from '@pnkl-frontend/shared';

import { CrmEmailCampaignHelpComponent } from './documents';
import { CaDocComponent } from './documents/CorporateActions/corporateActions.help';
import { CdlDocComponent } from './documents/CRM/crmDistributionList.help';
import { CiDocComponent } from './documents/CRM/crmInvestors.help';
import { CpDocComponent } from './documents/CRM/crmProspecting.help';
import { DashboardDocComponent } from './documents/Dashboard/dashboard.help';
import { OmsDocComponent } from './documents/OMS/oms.help';
import { PositionsDocComponent } from './documents/Positions/positions.help';
import { PricingDocComponent } from './documents/Pricing/pricing.help';
import { ReconDocComponent } from './documents/Recon/reconciliation.help';
import { ReportsDocComponent } from './documents/Reports/reports.help';
import { SecuritiesDocComponent } from './documents/Securities/securities.help';
import { HelpHomeComponent } from './help-home/help-home.component';
import { HelpRoutingModule } from './help-routing.module';
import { ModuleDocumentationComponent } from './module-documentation/module-documentation.component';

@NgModule({
  declarations: [
    HelpHomeComponent,
    ModuleDocumentationComponent,
    CaDocComponent,
    CdlDocComponent,
    CiDocComponent,
    CpDocComponent,
    DashboardDocComponent,
    OmsDocComponent,
    PositionsDocComponent,
    PricingDocComponent,
    ReconDocComponent,
    ReportsDocComponent,
    SecuritiesDocComponent,
    CrmEmailCampaignHelpComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    SharedModule,
    ReactiveFormsModule,
    HelpRoutingModule
  ]
})
export class HelpModule {}
