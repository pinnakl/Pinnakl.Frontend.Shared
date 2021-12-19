import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { ClientConnectivity, ClientConnectivityFromApi } from '../models';

@Injectable()
export class ClientConnectivityService {
  private readonly clientConnectivityEndpoint = 'entities/client_connectivity';
  constructor(private readonly wsp: WebServiceProvider) {}

  getClientConnectivities(): Promise<ClientConnectivity[]> {
    return this.wsp
      .getHttp<ClientConnectivityFromApi[]>({
        endpoint: this.clientConnectivityEndpoint,
        params: {
          fields: [
            'Id',
            'AdminId',
            'CustodianId',
            'Entity',
            'EntityType',
            'Recon_Indicator',
            'StockLoan_Indicator',
            'TradeFile_Indicator'
          ]
        }
      })
      .then(clientConnectivities => clientConnectivities.map(this.formatClientConnectivity));
  }

  private formatClientConnectivity(
    entity: ClientConnectivityFromApi
  ): ClientConnectivity {
    const id = parseInt(entity.id, 10);
    const adminId = parseInt(entity.adminid, 10);
    const custodianId = parseInt(entity.custodianid, 10);
    return new ClientConnectivity(
      !isNaN(adminId) ? adminId : null,
      !isNaN(custodianId) ? custodianId : null,
      entity.entity,
      entity.entitytype,
      !isNaN(id) ? id : null,
      entity.recon_indicator === 'True',
      entity.stockloan_indicator === 'True',
      entity.tradefile_indicator === 'True'
    );
  }
}
