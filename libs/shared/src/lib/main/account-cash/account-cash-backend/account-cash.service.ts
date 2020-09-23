import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { AccountCashFromApi } from './account-cash-from-api.model';
import { AccountCash } from './account-cash.model';

@Injectable()
export class AccountCashService {
  private readonly RESOURCE_URL = '/account_cash';
  private readonly fields = ['accountId', 'cash', 'date', 'id'];

  constructor(private wsp: WebServiceProvider) {}

  get(accountId: number, date: Date): Promise<AccountCash> {
    const formattedDate = moment(date).format('MM/DD/YYYY');
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields: this.fields,
        filters: [
          {
            key: 'accountId',
            type: 'EQ',
            value: [accountId.toString()]
          },
          {
            key: 'date',
            type: 'EQ',
            value: [formattedDate]
          }
        ]
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then(entities =>
        entities.length !== 1 ? null : this.format(entities[0])
      );
  }

  private format(entity: AccountCashFromApi): AccountCash {
    return {
      accountId: parseInt(entity.accountid),
      cash: parseFloat(entity.cash),
      date: moment(entity.date, 'DD-MM-YYYY').toDate(),
      id: parseInt(entity.id)
    };
  }
}
