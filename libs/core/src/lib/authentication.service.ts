import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { Store } from '@ngrx/store';
import { ClearStore } from '@pnkl-frontend/app-state';
import {
  SessionInformation,
  SessionInformationFromApi
} from '@pnkl-frontend/authentication';
import { UserFromApi } from './models/user-from-api.model';
import { User } from './models/user.model';
import { UserService } from './user.service';
import { WebServiceProvider } from './web-service-provider.service';

interface AuthenticationErrorFromApi {
  message: string;
}

@Injectable()
export class AuthenticationService {
  constructor(
    private userService: UserService,
    private store: Store<any>,
    private wsp: WebServiceProvider
  ) {}

  authenticate(username: string, password: string): Promise<User> {
    return this.wsp
      .authenticate({ application: 'Desktop', password, username })
      .then((user: UserFromApi) => {
        return this.formatUser({ ...user, username });
      })
      .catch((error: AuthenticationErrorFromApi) => {
        const { message: errorMessage } = error;
        if (!errorMessage.toLowerCase().includes('too many logins')) {
          throw new Error(errorMessage);
        }
        const activeSessionsStringStartingIndex = errorMessage.indexOf('[');
        const activeSessionsStringEndingIndex =
          errorMessage.lastIndexOf(']') + 1;
        const activeSessionsString = errorMessage.slice(
          activeSessionsStringStartingIndex,
          activeSessionsStringEndingIndex
        );
        let activeSessions: SessionInformation[] = [];
        try {
          const activeSessionsFromApi: SessionInformationFromApi[] = JSON.parse(
            activeSessionsString
          );
          activeSessions = activeSessionsFromApi.map(
            this.formatSessionInformation
          );
        } catch {}
        throw {
          message: 'Too many logins',
          activeSessions
        };
      });
  }

  deAuthenticate(token: string): Promise<void> {
    return this.wsp.deAuthenticate(token);
  }

  formatUser(user: UserFromApi): User {
    const clientId = parseInt(user.clientid),
      firstName = user.firstname,
      id = parseInt(user.id),
      lastName = user.lastname;
    return new User(
      !isNaN(clientId) ? clientId : null,
      user.features ? user.features.split(',') : [],
      firstName,
      `${firstName} ${lastName}`,
      !isNaN(id) ? id : null,
      lastName,
      user.token,
      user.username
    );
  }

  async logout(): Promise<void> {
    const user = this.userService.getUser();
    localStorage.clear();
    this.store.dispatch(new ClearStore());

    if (!user) {
      return;
    }
    await this.wsp.deAuthenticate(user.token);
  }

  private formatSessionInformation(
    entity: SessionInformationFromApi
  ): SessionInformation {
    const createdBy = parseInt(entity.createdby),
      createdDateMoment = moment.utc(
        entity.createddate,
        'MM/DD/YYYY hh:mm:ss a'
      ),
      id = parseInt(entity.id),
      updatedBy = parseInt(entity.updatedby),
      updatedDateMoment = moment.utc(
        entity.updateddate,
        'MM/DD/YYYY hh:mm:ss a'
      ),
      userId = parseInt(entity.userid);
    return {
      active: entity.active === 'True',
      browser: entity.browser,
      city: entity.city,
      country: entity.country,
      createdBy: !isNaN(createdBy) ? createdBy : null,
      createdDate: createdDateMoment.isValid()
        ? createdDateMoment.toDate()
        : null,
      deviceDetail: entity.devicedetail,
      fingerprint: entity.fingerprint,
      id: !isNaN(id) ? id : null,
      ipAddress: entity.ipaddress,
      language: entity.language,
      mobileToken: entity.mobiletoken,
      os: entity.os,
      screenresolution: entity.screenresolution,
      timezone: entity.timezone,
      updatedBy: !isNaN(updatedBy) ? updatedBy : null,
      updatedDate: updatedDateMoment.isValid()
        ? updatedDateMoment.toDate()
        : null,
      userId: !isNaN(userId) ? userId : null,
      userToken: entity.usertoken
    };
  }
}
