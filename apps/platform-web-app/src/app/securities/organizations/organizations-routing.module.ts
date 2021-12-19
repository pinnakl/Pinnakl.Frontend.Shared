import { Injectable, NgModule } from '@angular/core';
import { Resolve, RouterModule, Routes } from '@angular/router';

import { RouteResolverComponent } from '@pnkl-frontend/shared';
import { CountryService } from '@pnkl-frontend/shared';
import { OrganizationService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { OrganizationsResolvedData } from './organizations-resolved-data.model';
import { OrganizationsComponent } from './organizations.component';

@Injectable()
export class OrganizationsResolve
  implements Resolve<OrganizationsResolvedData> {
  constructor(
    private readonly countryService: CountryService,
    private readonly organizationService: OrganizationService,
    private readonly securityService: SecurityService
  ) {}

  async resolve(): Promise<OrganizationsResolvedData> {
    const attributeName =
      '/security_master/payload/instrument/master_information/organization_master/organization_status';
    return Promise.all([
      this.countryService.getCountries(),
      this.organizationService.getAllOrganizations(),
      this.securityService.getSecurityAttributeOptions(attributeName, true)
    ]).then(result => {
      const [countries, organizations, organizationStatusTypes] = result;
      return new OrganizationsResolvedData(
        countries,
        organizations,
        organizationStatusTypes
      );
    });
  }
}

const routes: Routes = [
  {
    path: 'organizations',
    component: RouteResolverComponent,
    data: {
      title: 'Organizations',
      resolvingPath: 'securities/organizations-resolved'
    }
  },
  {
    path: 'organizations-resolved',
    component: OrganizationsComponent,
    resolve: {
      resolvedData: OrganizationsResolve
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [OrganizationsResolve]
})
export class OrganizationsRoutingModule {}
