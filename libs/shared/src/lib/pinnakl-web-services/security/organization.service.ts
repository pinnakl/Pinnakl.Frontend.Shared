import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { Organization } from '../../models/security';
import { OrganizationFromApi } from '../../models/security/organization-from-api.model';

@Injectable()
export class OrganizationService {
  private readonly _organizationsEndpoint = 'entities/organizations';

  private _organizations: Organization[];

  constructor(private readonly wsp: WebServiceProvider) { }

  getAllOrganizations(): Promise<Organization[]> {
    if (this._organizations) {
      return Promise.resolve(this._organizations);
    }

    return this.wsp
      .getHttp<OrganizationFromApi[]>({
        endpoint: this._organizationsEndpoint,
        params: {
          fields: [
            'Country_Code',
            'Id',
            'Name',
            'Risk_Country_Code',
            'Status_Id',
            'Ticker'
          ]
        }
      })
      .then(entities => {
        this._organizations = entities.map(this.formatOrganization);
        return this._organizations;
      });
  }

  postOrganization(entityToSave: Organization): Promise<Organization> {
    return this.wsp
      .postHttp<OrganizationFromApi>({
        endpoint: this._organizationsEndpoint,
        body: this.getOrganizationForServiceRequest(entityToSave)
      })
      .then(this.formatOrganization);
  }

  putOrganization(entityToSave: Organization): Promise<Organization> {
    return this.wsp
      .putHttp<OrganizationFromApi>({
        endpoint: this._organizationsEndpoint,
        body: this.getOrganizationForServiceRequest(entityToSave)
      })
      .then(this.formatOrganization);
  }

  private formatOrganization(entity: OrganizationFromApi): Organization {
    const id = parseInt(entity.id, 10);
    const statusId = parseInt(entity.status_id, 10);
    return new Organization(
      entity.country_code,
      !isNaN(id) ? id : null,
      entity.name,
      entity.risk_country_code,
      !isNaN(statusId) ? statusId : null,
      entity.ticker
    );
  }

  private getOrganizationForServiceRequest(
    entity: Organization
  ): OrganizationFromApi {
    let entityForApi = {} as OrganizationFromApi,
      { countryCode, id, name, riskCountryCode, statusId, ticker } = entity;
    if (countryCode !== undefined) {
      entityForApi.country_code = countryCode;
    }
    if (id !== undefined) {
      entityForApi.id = id.toString();
    }
    if (name !== undefined) {
      entityForApi.name = name;
    }
    if (riskCountryCode !== undefined) {
      entityForApi.risk_country_code = riskCountryCode;
    }
    if (statusId !== undefined) {
      entityForApi.status_id = statusId.toString();
    }
    if (ticker !== undefined) {
      entityForApi.ticker = ticker;
    }
    return entityForApi;
  }
}
