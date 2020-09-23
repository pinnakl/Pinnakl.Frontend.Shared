import { Injectable } from '@angular/core';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { OrganizationFromApi } from '../../models/security/organization-from-api.model';
import { Organization } from '../../models/security/organization.model';

@Injectable()
export class OrganizationService {
  private readonly ORGANIZATIONS_URL = 'organizations';

  private _organizations: Organization[];

  constructor(private wsp: WebServiceProvider) {}

  getAllOrganizations(): Promise<Organization[]> {
    if (this._organizations) {
      return Promise.resolve(this._organizations);
    }
    const fields = [
      'Country_Code',
      'Id',
      'Name',
      'Risk_Country_Code',
      'Status_Id',
      'Ticker'
    ];

    const getWebRequest: GetWebRequest = {
      endPoint: this.ORGANIZATIONS_URL,
      options: {
        fields: fields
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then((entities: OrganizationFromApi[]) => {
        this._organizations = entities.map(entity =>
          this.formatOrganization(entity)
        );
        return this._organizations;
      });
  }

  postOrganization(entityToSave: Organization): Promise<Organization> {
    let requestBody = this.getOrganizationForServiceRequest(entityToSave);
    return this.wsp
      .post({
        endPoint: this.ORGANIZATIONS_URL,
        payload: requestBody
      })
      .then((entity: OrganizationFromApi) => this.formatOrganization(entity));
  }

  putOrganization(entityToSave: Organization): Promise<Organization> {
    let requestBody = this.getOrganizationForServiceRequest(entityToSave);
    return this.wsp
      .put({
        endPoint: this.ORGANIZATIONS_URL,
        payload: requestBody
      })
      .then((entity: OrganizationFromApi) => this.formatOrganization(entity));
  }

  private formatOrganization(entity: OrganizationFromApi): Organization {
    let id = parseInt(entity.id),
      statusId = parseInt(entity.status_id);
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
