import { Injectable } from '@angular/core';

import {
  DeleteWebRequest,
  GetWebRequest,
  PostWebRequest,
  PutWebRequest,
  WebServiceProvider
} from '@pnkl-frontend/core';
import { Custodian } from '../models/oms/custodian.model';

@Injectable()
export class CustodianService {
  private readonly RESOURCE_URL = 'custodians';

  constructor(private wsp: WebServiceProvider) {}

  getCustodians(
    primeBrokerIndicator: boolean = undefined
  ): Promise<Custodian[]> {
    let fields = ['CustodianCode', 'CustodianName', 'PrimeBrokerIndicator'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields: fields
      }
    };

    if (
      primeBrokerIndicator !== undefined &&
      typeof primeBrokerIndicator === 'boolean'
    ) {
      (<any>getWebRequest.options).filters = [
        {
          key: 'primebrokerindicator',
          type: 'EQ',
          value: [primeBrokerIndicator ? '1' : '0']
        }
      ];
    }

    return this.wsp
      .get(getWebRequest)
      .then(result => result.map(x => this.formatCustodian(x)));
  }

  formatCustodian(result: any): Custodian {
    let id = parseInt(result.id);
    return new Custodian(
      !isNaN(id) ? id : null,
      result.custodiancode,
      result.custodianname,
      result.primebrokerindicator === 'True' ? true : false
    );
  }

  saveCustodian(
    custodianCode: string,
    custodianName: string
  ): Promise<Custodian> {
    const postWebRequest: PostWebRequest = {
      endPoint: this.RESOURCE_URL,
      payload: {
        custodiancode: custodianCode,
        custodianname: custodianName
      }
    };

    return this.wsp
      .post(postWebRequest)
      .then(result => this.formatCustodian(result));
  }

  updateCustodian(
    id: number,
    custodianCode: string,
    custodianName: string
  ): Promise<Custodian> {
    const putWebRequest: PutWebRequest = {
      endPoint: this.RESOURCE_URL,
      payload: {
        id: id,
        custodiancode: custodianCode,
        custodianname: custodianName
      }
    };

    return this.wsp
      .put(putWebRequest)
      .then(result => this.formatCustodian(result));
  }

  confirmDeleteForCounterparty(id: number): Promise<any> {
    let fields = ['id'];
    const getWebRequest: GetWebRequest = {
      endPoint: 'trade_allocations',
      options: {
        fields: fields,
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
    };
    return this.wsp.get(getWebRequest);
  }

  deleteCustodian(id: number): Promise<any> {
    const deleteWebRequest: DeleteWebRequest = {
      endPoint: this.RESOURCE_URL,
      payload: {
        id: id
      }
    };

    return this.wsp.delete(deleteWebRequest);
  }
}
