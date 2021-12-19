import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SortableModule } from '@progress/kendo-angular-sortable';

import {
  PinnaklGridModule,
  ValueHistoryManagerModule
} from '@pnkl-frontend/shared';
import { SharedModule } from '@pnkl-frontend/shared';
import { AmortScheduleComponent, AmortScheduleService } from './amort-schedule';
import { BondCouponRateManagerComponent } from './bond';
import { BondAdditionalInformationComponent } from './bond/bond-additional-information/bond-additional-information.component';
import { BondInformationComponent } from './bond/bond-information/bond-information.component';
import { BondComponent } from './bond/bond.component';
import { CdsInformationComponent } from './cds/cds-information/cds-information.component';
import { CdsComponent } from './cds/cds.component';
import { ClaimInformationComponent } from './claim/claim-information/claim-information.component';
import { ClaimComponent } from './claim/claim.component';
import { CurrencyInformationHostComponent } from './currency/currency-information/currency-information-host.component.test';
import { CurrencyInformationComponent } from './currency/currency-information/currency-information.component';
import { CurrencyComponent } from './currency/currency.component';
import {
  OldCustomAttributeCreatorComponent
} from './custom-attributes/custom-attribute-creator/custom-attribute-creator.component';
import { OldCustomAttributesComponent } from './custom-attributes/custom-attributes.component';
import { EquitySharesOutstandingManagerComponent } from './equity';
import { EquityInformationComponent } from './equity/equity-information/equity-information.component';
import { EquityComponent } from './equity/equity.component';
import { AdminIdentifiersComponent } from './external-identifiers/admin-identifiers/admin-identifiers.component';
import { SortAdminIdentifiers } from './external-identifiers/admin-identifiers/sort-admin-identifiers.pipe';
import { ExternalIdentifiersComponent } from './external-identifiers/external-identifiers.component';
import { PbIdentifiersComponent } from './external-identifiers/pb-identifiers/pb-identifiers.component';
import { FundInformationComponent } from './fund/fund-information/fund-information.component';
import { FundComponent } from './fund/fund.component';
import { FutureInformationComponent } from './future/future-information/future-information.component';
import { FutureComponent } from './future/future.component';
import { LoanAdditionalInformationComponent } from './loan/loan-additional-information/loan-additional-information.component';
import { LoanInformationComponent } from './loan/loan-information/loan-information.component';
import { LoanComponent } from './loan/loan.component';
import { OptionAdditionalInformationComponent } from './option/option-additional-information/option-additional-information.component';
import { OptionInformationComponent } from './option/option-information/option-information.component';
import { OptionComponent } from './option/option.component';
import { OrganizationsRoutingModule } from './organizations/organizations-routing.module';
import { OrganizationsComponent } from './organizations/organizations.component';
import {
  PaymentHistoryComponent,
  PaymentHistoryService
} from './payment-history';
import { PeloanInformationComponent } from './peloan/peloan-information/peloan-information.component';
import { PeloanComponent } from './peloan/peloan.component';
import { PeloanService } from './peloan/peloan.service';
import {
  PreferredAdditionalInformationComponent
} from './preferred/preferred-additional-information/preferred-additional-information.component'; // tslint:disable-line:max-line-length
import { PreferredInformationComponent } from './preferred/preferred-information/preferred-information.component';
import { PreferredComponent } from './preferred/preferred.component';
import { PublicIdentifiersProcessingService } from './public-identifiers';
import { PublicIdentifiersComponent } from './public-identifiers/public-identifiers.component';
import { SortMarketIdentifiers } from './public-identifiers/sort-market-identifiers.pipe';
import { SortPublicIdentifiers } from './public-identifiers/sort-public-identifiers.pipe';
import { SecurityHistoryComponent } from './securities-history/securities-history.component';
import { AddSecurityAutomaticComponent } from './securities-home/add-security-automatic/add-security-automatic.component';
import { SecuritiesHomeRoutingModule } from './securities-home/securities-home-routing.module';
import { SecuritiesHomeComponent } from './securities-home/securities-home.component';
import { SecurityDetailsRoutingModule } from './security-details/security-details-routing.module';
import { SecurityDetailsComponent } from './security-details/security-details.component';
import { OrganizationSelectorComponent } from './shared/organization-selector/organization-selector.component';
import { SecuritiesHelper } from './shared/securities-helper.service';
import { UnderlyingIdentifierComponent } from './shared/underlying-identifier/underlying-identifier.component';
import { TRSComponent, TRSService } from './trs';
import { TrsInformationComponent } from './trs/trs-information/trs-information.component';

@NgModule({
  declarations: [
    AmortScheduleComponent,
    AdminIdentifiersComponent,
    BondAdditionalInformationComponent,
    BondComponent,
    BondCouponRateManagerComponent,
    BondInformationComponent,
    ClaimComponent,
    ClaimInformationComponent,
    CurrencyComponent,
    CurrencyInformationHostComponent,
    CurrencyInformationComponent,
    OldCustomAttributeCreatorComponent,
    EquityComponent,
    EquityInformationComponent,
    EquitySharesOutstandingManagerComponent,
    ExternalIdentifiersComponent,
    FundComponent,
    FundInformationComponent,
    FutureComponent,
    FutureInformationComponent,
    LoanAdditionalInformationComponent,
    LoanComponent,
    LoanInformationComponent,
    OptionAdditionalInformationComponent,
    OptionComponent,
    OptionInformationComponent,
    OrganizationsComponent,
    OrganizationSelectorComponent,
    PbIdentifiersComponent,
    PreferredAdditionalInformationComponent,
    PreferredComponent,
    PreferredInformationComponent,
    PublicIdentifiersComponent,
    SecuritiesHomeComponent,
    SecurityDetailsComponent,
    SecurityHistoryComponent,
    SortAdminIdentifiers,
    SortMarketIdentifiers,
    SortPublicIdentifiers,
    CdsComponent,
    CdsInformationComponent,
    UnderlyingIdentifierComponent,
    PaymentHistoryComponent,
    PeloanComponent,
    PeloanInformationComponent,
    TrsInformationComponent,
    TRSComponent,
    AddSecurityAutomaticComponent,
    OldCustomAttributesComponent
  ],
  exports: [
    AmortScheduleComponent,
    PaymentHistoryComponent,
    AddSecurityAutomaticComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    OrganizationsRoutingModule,
    PinnaklGridModule,
    ReactiveFormsModule,
    SecuritiesHomeRoutingModule,
    SecurityDetailsRoutingModule,
    SortableModule,
    SharedModule,
    ValueHistoryManagerModule
  ],
  providers: [
    AmortScheduleService,
    PaymentHistoryService,
    PeloanService,
    PublicIdentifiersProcessingService,
    SecuritiesHelper,
    TRSService
  ]
})
export class SecuritiesModule {}
