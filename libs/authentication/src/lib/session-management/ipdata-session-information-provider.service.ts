import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ISessionInformationProvider } from './session-information-provider.service';

interface IpdataSessionInformationFromApi {
  city: string;
  country_name: string;
  ip: string;
}
interface IpdataSessionInformation {
  city: string;
  country: string;
  ipAddress: string;
}

@Injectable()
export class IpdataSessionInformationProvider
  implements ISessionInformationProvider {
  private readonly _API_KEY =
    'b6fa06cbe7820e5ee7d23a491cfd0a2b1abeb0f9a2e0e2f1d2305dd3';
  private readonly _REQUEST_URL_TEMPLATE = 'https://api.ipdata.co?api-key=';
  constructor(private readonly _http: HttpClient) {}

  async get(): Promise<IpdataSessionInformation> {
    const url = `${this._REQUEST_URL_TEMPLATE}${this._API_KEY}`;
    try {
      const {
        city,
        country_name: country,
        ip: ipAddress
      } = await this._http
        .get<IpdataSessionInformationFromApi>(url)
        .toPromise();
      return { city, country, ipAddress };
    } catch (e) {
      console.log(e);
      return e;
    }
  }
}
