import { Injectable } from '@angular/core';

import 'clientjs';
declare const ClientJS;
import { ISessionInformationProvider } from './session-information-provider.service';

interface ClientJsSessionInformation {
  browser: string;
  fingerprint: number;
  isMobile: boolean;
  language: string;
  os: string;
  screenResolution: string;
  timeZone: string;
}

@Injectable()
export class ClientJsSessionInformationProvider
  implements ISessionInformationProvider {
  private readonly _client: ClientJS = new ClientJS();

  async get(): Promise<ClientJsSessionInformation> {
    return {
      browser: `${this._client.getBrowser()} ${this._client.getBrowserMajorVersion()}`,
      fingerprint: this._client.getFingerprint(),
      isMobile: this._client.isMobile(),
      language: this._client.getLanguage(),
      os: `${this._client.getOS()} ${this._client.getOSVersion()}`,
      screenResolution: this._client.getCurrentResolution(),
      timeZone: this._client.getTimeZone()
    };
  }
}
