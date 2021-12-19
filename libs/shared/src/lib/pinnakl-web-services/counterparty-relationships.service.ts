import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { CounterPartyRelationshipType } from '../models/oms/counterparty-relationship-types.model';

@Injectable()
export class CounterpartyRelationshipsService {
  constructor(private readonly wsp: WebServiceProvider) {}

  async getCounterPartyRelationshipTypes(): Promise<
    CounterPartyRelationshipType[]
  > {
    const fields = ['reltype'];

    const entities = await this.wsp.getHttp<any[]>({
      endpoint: 'entities/counterparty_relationship_types',
      params: {
        fields: fields
      }
    });

    return entities.map(relType =>
      this.formatCounterPartyRelationshipType(relType)
    );
  }

  formatCounterPartyRelationshipType(
    result: any
  ): CounterPartyRelationshipType {
    const id = parseInt(result.id, 10);
    return new CounterPartyRelationshipType(
      !isNaN(id) ? id : null,
      result.reltype
    );
  }

  getAllAccounts(accountService) {
    return accountService.getAccounts();
  }

  async confirmDeleteForCounterpartyRelationship(id: number): Promise<any> {
    const fields = ['id'];

    const entities = await this.wsp.getHttp<any[]>({
      endpoint: 'entities/trade_requests',
      params: {
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
    });

    return entities;
  }
}
