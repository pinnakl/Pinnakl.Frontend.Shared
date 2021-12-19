import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { Country } from '../../models/security';
import { CountryFromApi } from '../../models/security/country-from-api.model';

@Injectable()
export class CountryService {
  private readonly _countriesEndpoint = 'entities/countries';

  constructor(private readonly wsp: WebServiceProvider) {}

  async getCountries(): Promise<Country[]> {
    const entities = await this.wsp.getHttp<CountryFromApi[]>({
      endpoint: this._countriesEndpoint,
      params: {
        fields: ['Code', 'Id', 'Name', 'Region', 'SubRegion']
      }
    });

    return entities.length === 0 ? null : entities.map(this.formatCountry);
  }
  private formatCountry(entity: CountryFromApi): Country {
    const code = entity.code,
      id = parseInt(entity.id, 10),
      name = entity.name,
      region = entity.region,
      subRegion = entity.subRegion;
    return new Country(code, id, name, region, subRegion);
  }
}
