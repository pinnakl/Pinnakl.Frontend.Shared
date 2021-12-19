import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { WebServiceProvider } from '@pnkl-frontend/core';

@Injectable()
export class UniveralSearchService {
  private readonly _crmUniversalSearchEndpoint = 'entities/crm_universal_search';

  constructor(private readonly wsp: WebServiceProvider) { }

  async getSearchOrganization<T>(
    value: string,
    artifactType: string
  ): Promise<T[]> {

    let filters = [
      {
        key: 'searchstring',
        type: 'EQ',
        value: [value]
      }
    ];
    if (artifactType) {
      filters.push({
        key: 'artifactType',
        type: 'EQ',
        value: [artifactType]
      })
    }

    return await this.wsp.getHttp<T[]>({
      endpoint: this._crmUniversalSearchEndpoint,
      params: { filters }
    });
  }
}
