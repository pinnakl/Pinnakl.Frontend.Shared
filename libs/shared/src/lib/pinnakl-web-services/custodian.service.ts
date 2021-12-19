import { Injectable } from '@angular/core';

import {
  WebServiceProvider
} from '@pnkl-frontend/core';
import { Custodian } from '../models/oms';

@Injectable()
export class CustodianService {
  private readonly _custodiansEndpoint = 'entities/custodians';

  constructor(private readonly wsp: WebServiceProvider) {}

  async getCustodians(
    primeBrokerIndicator: boolean = undefined
  ): Promise<Custodian[]> {
    const fields = ['CustodianCode', 'CustodianName', 'PrimeBrokerIndicator'];

    let filters = [];
    if (
      primeBrokerIndicator !== undefined &&
      typeof primeBrokerIndicator === 'boolean'
    ) {
      filters = [
        {
          key: 'primebrokerindicator',
          type: 'EQ',
          value: [primeBrokerIndicator ? '1' : '0']
        }
      ];
    }

    const entities = await this.wsp.getHttp<any[]>({
      endpoint: this._custodiansEndpoint,
      params: {
        fields: fields,
        filters: filters
      }
    });

    return entities.map(this.formatCustodian);
  }

  formatCustodian(result: any): Custodian {
    const id = parseInt(result.id, 10);
    return new Custodian(
      !isNaN(id) ? id : null,
      result.custodiancode,
      result.custodianname,
      result.primebrokerindicator === 'True'
    );
  }

  async saveCustodian(
    custodiancode: string,
    custodianname: string
  ): Promise<Custodian> {
    const result = await this.wsp.postHttp<any>({
      endpoint: this._custodiansEndpoint,
      body: {
        custodiancode,
        custodianname
      }
    });

    return this.formatCustodian(result);
  }

  async updateCustodian(
    id: number,
    custodianCode: string,
    custodianName: string
  ): Promise<Custodian> {
    const result = await this.wsp
      .putHttp({
        endpoint: this._custodiansEndpoint,
        body: {
          id: id,
          custodiancode: custodianCode,
          custodianname: custodianName
        }
      });

    return this.formatCustodian(result);
  }

  async confirmDeleteForCounterparty(id: number): Promise<any> {
    return this.wsp.getHttp<any[]>({
      endpoint: 'entities/trade_allocations',
      params: {
        fields: ['id'],
        filters: [
          {
            key: 'custodianid',
            type: 'EQ',
            value: [id.toString()]
          },
          {
            key: '',
            type: 'TOP',
            value: ['1']
          }
        ]
      }
    });
  }

  async deleteCustodian(id: number): Promise<any> {
    return this.wsp.deleteHttp({
      endpoint: `${this._custodiansEndpoint}/${id}`
    });
  }
}
