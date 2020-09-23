import { Injectable } from '@angular/core';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { CounterPartyRelationshipType } from '../models/oms/counterparty-relationship-types.model';

@Injectable()
export class CounterpartyRelationshipsService {
  constructor(private wsp: WebServiceProvider) {}

  getCounterPartyRelationshipTypes(): Promise<CounterPartyRelationshipType[]> {
    let fields = ['reltype'];
    const getWebRequest: GetWebRequest = {
      endPoint: 'counterparty_relationship_types',
      options: {
        fields: fields
      }
    };
    return this.wsp
      .get(getWebRequest)
      .then(result =>
        result.map(x => this.formatCounterPartyRelationshipType(x))
      );
  }

  formatCounterPartyRelationshipType(
    result: any
  ): CounterPartyRelationshipType {
    let id = parseInt(result.id);
    return new CounterPartyRelationshipType(
      !isNaN(id) ? id : null,
      result.reltype
    );
  }

  getAllAccounts(accountService) {
    return accountService.getAccounts();
  }

  confirmDeleteForCounterpartyRelationship(id: number): Promise<any> {
    let fields = ['id'];
    const getWebRequest: GetWebRequest = {
      endPoint: 'trade_requests',
      options: {
        fields: fields,
        filters: [
          {
            key: 'accounttype',
            type: 'EQ',
            value: ['bd']
          },
          {
            key: 'counterpartyid',
            type: 'EQ',
            value: [id.toString()]
          }
        ]
      }
    };
    return this.wsp.get(getWebRequest);
  }
}
