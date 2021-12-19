import { Injectable, NgModule } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterModule,
  Routes
} from '@angular/router';

import { CustomAttributeFeature, GenericEntityWithName } from '@pnkl-frontend/shared';
import { RouteResolverComponent } from '@pnkl-frontend/shared';
import { AccountService } from '@pnkl-frontend/shared';
import { ClientConnectivityService } from '@pnkl-frontend/shared';
import { OMSService } from '@pnkl-frontend/shared';
import { PricingService } from '@pnkl-frontend/shared';
import { AdminIdentifierService } from '@pnkl-frontend/shared';
import { CustomAttributesService } from '@pnkl-frontend/shared';
import { MarketService } from '@pnkl-frontend/shared';
import { OrganizationService } from '@pnkl-frontend/shared';
import { PbIdentifierService } from '@pnkl-frontend/shared';
import { PublicIdentifierService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { BondResolve, bondRoute } from '../bond/bond-route';
import { CdsResolve, cdsRoute } from '../cds/cds-route';
import { claimRoute } from '../claim/claim-route';
import { CurrencyResolve, currencyRoute } from '../currency/currency-route';
import { EquityResolve, equityRoute } from '../equity/equity-route';
import { FundResolve, fundRoute } from '../fund/fund-route';
import { FutureResolve, futureRoute } from '../future/future-route';
import { LoanResolve, loanRoute } from '../loan/loan-route';
import { OptionResolve, optionRoute } from '../option/option-route';
import { PeLoanResolve, peloanRoute } from '../peloan/peloan-route';
import { PreferredResolve, preferredRoute } from '../preferred/preferred-route';
import { SecuritiesHelper } from '../shared/securities-helper.service';
import { TrsResolve, trsRoute } from '../trs/trs-route';
import { SecurityDetailsResolvedData } from './security-details-resolved-data.model';
import { SecurityDetailsComponent } from './security-details.component';

@Injectable()
export class SecurityDetailsResolve
  implements Resolve<SecurityDetailsResolvedData> {
  constructor(
    private readonly accountService: AccountService,
    private readonly adminIdentifierService: AdminIdentifierService,
    private readonly clientConnectivityService: ClientConnectivityService,
    private readonly customAttributesService: CustomAttributesService,
    private readonly marketService: MarketService,
    private readonly omsService: OMSService,
    private readonly organizationService: OrganizationService,
    private readonly pbIdentifierService: PbIdentifierService,
    private readonly pricingService: PricingService,
    private readonly publicIdentifierService: PublicIdentifierService,
    private readonly securitiesHelper: SecuritiesHelper,
    private readonly securityService: SecurityService
  ) { }

  async resolve(route: ActivatedRouteSnapshot): Promise<SecurityDetailsResolvedData> {
    const assetType: string = route.params.assetType,
      assetTypeId = +route.params.assetTypeId,
      securityId = +route.params.securityId,
      securitiesInSession = this.securitiesHelper.securities,
      editSecurityDataPromise = !securityId
        ? null
        : Promise.all([
            this.accountService.getAdminAccounts(),
            this.adminIdentifierService.getIdentifiers(securityId),
            this.clientConnectivityService.getClientConnectivities(),
            this.marketService.getMarkets(),
            this.pbIdentifierService.getIdentifiers(securityId),
            this.publicIdentifierService.getPublicIdentifiers(securityId),
            this.getPublicIdentifierTypes(assetType),
            securitiesInSession
              ? securitiesInSession
              : this.securityService.getAllSecurities(),
            this.securityService.getSecurity(securityId),
            this.marketService.getSecurityMarkets(securityId)
          ]),
      customAttributesPromise = !securityId
        ? null
        : Promise.all([
            this.customAttributesService.getCustomAttributes(CustomAttributeFeature.SECURITY),
            this.customAttributesService.getCustomAttributeValuesForFeature(
              securityId,
              CustomAttributeFeature.SECURITY
            )
          ]);
    return Promise.all([
      this.omsService.getCurrencies(),
      this.pricingService
        .getPricingSourceBySourceTypeAndName('secref', 'manual')
        .then(manualSecuritySource => +manualSecuritySource.id),
      this.organizationService.getAllOrganizations(),
      this.securityService.getSecurityAttributeOptions('sector'),
      this.securityService.getSecurityTypesForAssetType(assetTypeId),
      customAttributesPromise,
      editSecurityDataPromise
    ]).then(result => {
      const [
        currencies,
        manualSecuritySource,
        organizations,
        sectorOptions,
        securityTypes,
        customAttributesObject,
        editSecurityData
      ] = result;
      delete this.securitiesHelper.securities;
      if (!editSecurityData) {
        return new SecurityDetailsResolvedData(
          currencies,
          manualSecuritySource,
          organizations,
          sectorOptions,
          securityTypes
        );
      }
      const [
          adminAccounts,
          adminIdentifiers,
          clientConnectivities,
          markets,
          pbIdentifiers,
          publicIdentifiers,
          publicIdentifierTypes,
          securities,
          security,
          securityMarkets
        ] = editSecurityData,
        [customAttributes, customAttributeValues] = customAttributesObject;
      return new SecurityDetailsResolvedData(
        currencies,
        manualSecuritySource,
        organizations,
        sectorOptions,
        securityTypes,
        {
          adminAccounts,
          adminIdentifiers,
          clientConnectivities,
          customAttributes,
          customAttributeValues,
          markets,
          pbIdentifiers,
          publicIdentifiers,
          publicIdentifierTypes,
          securities,
          security,
          securityMarkets
        }
      );
    });
  }

  private getPublicIdentifierTypes(assetType: string): GenericEntityWithName[] {
    const publicIdentifierTypes = [
      new GenericEntityWithName(1, 'Ticker'),
      new GenericEntityWithName(2, 'Cusip'),
      new GenericEntityWithName(3, 'Isin'),
      new GenericEntityWithName(4, 'Sedol')
    ];
    switch (assetType.toLowerCase()) {
      case 'bankdebt':
        publicIdentifierTypes.push(new GenericEntityWithName(5, 'LoanId'));
        break;
      case 'option':
        publicIdentifierTypes.push(new GenericEntityWithName(5, 'OSISymbol'));
    }
    return publicIdentifierTypes;
  }
}

const routes: Routes = [
  {
    path: 'security-details/:assetTypeId/:assetType',
    component: RouteResolverComponent,
    data: {
      title: 'Security',
      resolvingPath: 'securities/security-details-resolved'
    }
  },
  {
    path: 'security-details-resolved',
    children: [
      bondRoute,
      cdsRoute,
      claimRoute,
      currencyRoute,
      equityRoute,
      fundRoute,
      futureRoute,
      loanRoute,
      optionRoute,
      preferredRoute,
      peloanRoute,
      trsRoute
    ],
    component: SecurityDetailsComponent,
    resolve: {
      resolvedData: SecurityDetailsResolve
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    BondResolve,
    CdsResolve,
    CurrencyResolve,
    EquityResolve,
    FundResolve,
    FutureResolve,
    LoanResolve,
    OptionResolve,
    PeLoanResolve,
    PreferredResolve,
    TrsResolve,
    SecurityDetailsResolve
  ]
})
export class SecurityDetailsRoutingModule {}
