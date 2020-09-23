import { Injectable } from '@angular/core';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { CountryFromApi } from '../../models/security/country-from-api.model';
import { Country } from '../../models/security/country.model';

@Injectable()
export class CountryService {
  private readonly RESOURCE_URL = '/countries';

  constructor(private wsp: WebServiceProvider) {}

  getCountries(): Promise<Country[]> {
    let fields = ['Code', 'Id', 'Name', 'Region', 'SubRegion'],
      queryString = `${this.RESOURCE_URL}?fields=${fields}`;

    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields: fields
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then((entities: CountryFromApi[]) =>
        entities.length === 0
          ? null
          : entities.map(entity => this.formatCountry(entity))
      );
  }
  private formatCountry(entity: CountryFromApi): Country {
    let code = entity.code,
      id = parseInt(entity.id),
      name = entity.name,
      region = entity.region,
      subRegion = entity.subRegion;
    return new Country(code, id, name, region, subRegion);
  }
}
