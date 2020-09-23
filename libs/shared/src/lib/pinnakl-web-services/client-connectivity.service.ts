import { Injectable } from '@angular/core';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { ClientConnectivityFromApi } from '../models/client-connectivity-from-api.model';
import { ClientConnectivity } from '../models/client-connectivity.model';

@Injectable()
export class ClientConnectivityService {
  private readonly RESOURCE_URL = 'client_connectivity';
  constructor(private wsp: WebServiceProvider) {}

  getClientConnectivities(): Promise<ClientConnectivity[]> {
    const fields = [
      'Id',
      'AdminId',
      'CustodianId',
      'Entity',
      'EntityType',
      'Recon_Indicator',
      'StockLoan_Indicator',
      'TradeFile_Indicator'
    ];
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields
      }
    };
    return this.wsp
      .get(getWebRequest)
      .then((clientConnectivities: ClientConnectivityFromApi[]) =>
        clientConnectivities.map(clientConnectivity =>
          this.formatClientConnectivity(clientConnectivity)
        )
      );
  }

  private formatClientConnectivity(
    entity: ClientConnectivityFromApi
  ): ClientConnectivity {
    let adminId = parseInt(entity.adminid),
      custodianId = parseInt(entity.custodianid),
      id = parseInt(entity.id);
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
