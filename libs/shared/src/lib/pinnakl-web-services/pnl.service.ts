import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';

@Injectable()
export class PnlService {
  constructor(private readonly wsp: WebServiceProvider) {}

  async getLastRunPnlDateByAccount(pnlaccount: string): Promise<any> {
    const fields = ['pnldate'];
    const pnl = await this.wsp.getHttp<any[]>({
      endpoint: 'entities/raw_pnl_data',
      params: {
        fields,
        filters: [
          { key: 'account', type: 'EQ', value: [pnlaccount] },
          {
            key: '',
            type: 'TOP',
            value: ['1']
          }
        ],
        orderBy: [{ field: 'PnlDate', direction: 'DESC' }]
      }
    });

    return pnl.length > 0 ? pnl[0].pnldate : null;
  }
}
