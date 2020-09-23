import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { PublicIdentifierFromApi } from '../../models/security/public-identifier-from-api.model';
import { PublicIdentifier } from '../../models/security/public-identifier.model';

@Injectable()
export class PublicIdentifierService {
  private readonly RESOURCE_URL = 'security_identifiers';

  constructor(private wsp: WebServiceProvider) {}

  deleteIdentifier(id: number): Promise<void> {
    return this.wsp.delete({ endPoint: this.RESOURCE_URL, payload: { id } });
  }

  getPublicIdentifiers(securityId: number): Promise<PublicIdentifier[]> {
    const fields = [
      'EndDate',
      'Id',
      'Identifier',
      'IdentifierType',
      'MarketId',
      'SecurityId',
      'StartDate'
    ];
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields,
        filters: [
          { key: 'SecurityId', type: 'EQ', value: [securityId.toString()] }
        ]
      }
    };
    return this.wsp
      .get(getWebRequest)
      .then((entities: PublicIdentifierFromApi[]) =>
        entities.map(entity => this.formatIdentifier(entity))
      );
  }

  getPublicIdentifiersByValue(identifier: string): Promise<PublicIdentifier[]> {
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields: ['Id', 'SecurityId'],
        filters: [{ key: 'Identifier', type: 'EQ', value: [identifier] }]
      }
    };
    return this.wsp
      .get(getWebRequest)
      .then((identifiers: PublicIdentifierFromApi[]) =>
        identifiers.map(publicIdentifier =>
          this.formatIdentifier(publicIdentifier)
        )
      );
  }

  postIdentifier(entityToSave: PublicIdentifier): Promise<PublicIdentifier> {
    let requestBody = this.getIdentifierForServiceRequest(entityToSave);
    return this.wsp
      .post({ endPoint: this.RESOURCE_URL, payload: requestBody })
      .then((entity: PublicIdentifierFromApi) => this.formatIdentifier(entity));
  }

  putIdentifier(entityToSave: PublicIdentifier): Promise<PublicIdentifier> {
    let requestBody = this.getIdentifierForServiceRequest(entityToSave);
    return this.wsp
      .put({ endPoint: this.RESOURCE_URL, payload: requestBody })
      .then((entity: PublicIdentifierFromApi) => this.formatIdentifier(entity));
  }

  private formatIdentifier(
    identifier: PublicIdentifierFromApi
  ): PublicIdentifier {
    let endDateMoment = moment(identifier.enddate, 'MM/DD/YYYY'),
      id = parseInt(identifier.id),
      marketId = parseInt(identifier.marketid),
      securityId = parseInt(identifier.securityid),
      startDateMoment = moment(identifier.startdate, 'MM/DD/YYYY');
    return new PublicIdentifier(
      endDateMoment.isValid() ? endDateMoment.toDate() : null,
      !isNaN(id) ? id : null,
      identifier.identifier,
      identifier.identifiertype,
      !isNaN(marketId) ? marketId : null,
      !isNaN(securityId) ? securityId : null,
      startDateMoment.isValid() ? startDateMoment.toDate() : null
    );
  }

  private getIdentifierForServiceRequest(
    entity: PublicIdentifier
  ): PublicIdentifierFromApi {
    let entityForApi = {} as PublicIdentifierFromApi,
      {
        endDate,
        id,
        identifier,
        identifierType,
        marketId,
        securityId,
        startDate
      } = entity;
    if (endDate !== undefined) {
      entityForApi.enddate =
        endDate !== null ? moment(endDate).format('MM/DD/YYYY') : 'null';
    }
    if (id !== undefined) {
      entityForApi.id = id.toString();
    }
    if (identifier !== undefined) {
      entityForApi.identifier = identifier;
    }
    if (identifierType !== undefined) {
      entityForApi.identifiertype = identifierType;
    }
    if (marketId !== undefined) {
      entityForApi.marketid = marketId !== null ? marketId.toString() : 'null';
    }
    if (securityId !== undefined) {
      entityForApi.securityid = securityId.toString();
    }
    if (startDate !== undefined) {
      entityForApi.startdate =
        startDate !== null ? moment(startDate).format('MM/DD/YYYY') : 'null';
    }
    return entityForApi;
  }
}
