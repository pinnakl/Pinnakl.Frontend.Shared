import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';

@Injectable()
export class PositionsLoadAllDataService {
  private readonly _pmsEndpoint = 'entities/pms';

  constructor(private readonly wsp: WebServiceProvider) {}

  getAllData(): Promise<any> {
    return this.wsp
      .getHttp({
        endpoint: this._pmsEndpoint
      });
  }
}
