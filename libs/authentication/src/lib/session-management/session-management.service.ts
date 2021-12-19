import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { SessionInformationFromApi, UserService, WebServiceProvider } from '@pnkl-frontend/core';
import { ClientJsSessionInformationProvider } from './client-js-session-information-provider.service';
import { IpdataSessionInformationProvider } from './ipdata-session-information-provider.service';

// Includes only required fields from SessionInformationFromApi
interface SessionInformationToPost extends Partial<SessionInformationFromApi> {
  active: string;
  application: string;
  browser: string;
  city: string;
  country: string;
  createdby: string;
  createddate: string;
  devicedetail: string;
  fingerprint: string;
  ipaddress: string;
  language: string;
  os: string;
  screenresolution: string;
  timezone: string;
  userid: string;
  usertoken: string;
}

@Injectable()
export class SessionManagementService {
  private readonly _sessionManagementEndpoint = 'entities/session_management';

  constructor(
    private readonly _clientJsSessionInformationProvider: ClientJsSessionInformationProvider,
    private readonly _ipdataSessionInformationProvider: IpdataSessionInformationProvider,
    private readonly _userService: UserService,
    private readonly _wsp: WebServiceProvider
  ) { }

  async post(): Promise<void> {
    const sessionInformation = await this._gatherSessionInformation();
    return this._wsp.postHttp({
      endpoint: this._sessionManagementEndpoint,
      body: sessionInformation
    });
  }

  private async _gatherSessionInformation(): Promise<SessionInformationToPost> {
    try {
      const clientJsSessionInformation = await this._clientJsSessionInformationProvider.get();
      const ipdataSessionInformation = await this._ipdataSessionInformationProvider.get();
      const {
        id: userId,
        token: currentUserToken
      } = this._userService.getUser();
      const currentUserId = userId.toString();
      // console.log(clientJsSessionInformation);
      const currentDate = moment()
        .utc()
        .format('MM/DD/YYYY hh:mm:ss a');
      const deviceDetail = clientJsSessionInformation.isMobile
        ? 'mobile'
        : 'computer';
      return {
        active: '1',
        application: 'Desktop',
        browser: clientJsSessionInformation.browser,
        city: ipdataSessionInformation.city,
        country: ipdataSessionInformation.country,
        createdby: currentUserId,
        createddate: currentDate,
        devicedetail: deviceDetail,
        fingerprint: clientJsSessionInformation.fingerprint.toString(),
        ipaddress: ipdataSessionInformation.ipAddress,
        language: clientJsSessionInformation.language,
        os: clientJsSessionInformation.os,
        screenresolution: clientJsSessionInformation.screenResolution,
        timezone: clientJsSessionInformation.timeZone,
        userid: currentUserId,
        usertoken: currentUserToken
      };
    } catch (e) {
      console.log(e);
      return e;
    }
  }
}
