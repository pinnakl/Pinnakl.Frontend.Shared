// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Routes
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

export const routes: Routes = [
  {
    path: '',
    component: HelpHomeComponent
  },
  {
    path: 'Dashboard',
    component: DashboardDocComponent
  },
  {
    path: 'Positions',
    component: PositionsDocComponent
  },
  {
    path: 'OMS',
    component: OmsDocComponent
  },
  {
    path: 'Pricing',
    component: PricingDocComponent
  },
  {
    path: 'Reconciliation',
    component: ReconDocComponent
  },
  {
    path: 'CRM Organizations',
    component: CiDocComponent
  },
  {
    path: 'Distribution List',
    component: CdlDocComponent
  },
  {
    path: 'CRM Prospecting',
    component: CpDocComponent
  },
  {
    path: 'Securities',
    component: SecuritiesDocComponent
  },
  {
    path: 'Corporate Actions',
    component: CaDocComponent
  },
  {
    path: 'Corporate Actions',
    component: CaDocComponent
  },
  {
    path: 'Reports',
    component: ReportsDocComponent
  },
  {
    path: 'Email Campaigns',
    component: CrmEmailCampaignHelpComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HelpRoutingModule {}
