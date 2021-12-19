import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import * as moment from 'moment';

import { Store } from '@ngrx/store';
import { ClearStore } from '@pnkl-frontend/app-state';
import { from, Observable } from 'rxjs';
import { SessionInformation, SessionInformationFromApi, User, UserAuthType, UserFromApi, UserFromApiModel } from './models';
import { PinnaklHttpService } from './pinnakl-http.service';
import { UserService } from './user.service';
import { WebServiceProvider } from './web-service-provider.service';

interface AuthenticationErrorFromApi {
  message: string;
  error: {
    hasOTPSecret: boolean;
    otpChannel: string;
  };
}


@Injectable()
export class AuthenticationService {
  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly store: Store<any>,
    private readonly wsp: WebServiceProvider,
    private readonly _pinnaklHttpService: PinnaklHttpService
  ) { }

  getQrSercet(username: string, password: string, userType: string, application = "Desktop"): Observable<string> {
    return from(this.wsp.qrSecret(username, password, userType, application));
  }

  forgotPassword(email: string): Observable<void[]> {
    return from(this.wsp.forgotPassword(email));
  }

  async authenticate(username: string, password: string, userType: string): Promise<User> {
    return this.wsp
      .authenticate({ application: 'Desktop', password, username, userType })
      .then((userFromApi: UserFromApiModel): User => {
        const user = this.formatLoginUser({ ...userFromApi, username });
        user.passwordResetRequired = userFromApi.user.passwordResetRequired;
        this.userService.setUser(user);
        return user;
      })
      .catch((error: AuthenticationErrorFromApi | HttpErrorResponse) => {
        // Handle 2FA
        if (
          error instanceof HttpErrorResponse &&
          error.url.substr(error.url.length - 4) === 'auth' &&
          error.headers.get('www-authenticate') === UserAuthType.TWO_FACTOR
        ) {
          throw {
            is2FA: true,
            otpChannel: error.error.otpChannel,
            hasOTPSecret: error.error.hasOTPSecret
          };
        }
        if (error instanceof HttpErrorResponse && error.status === 400) {
          throw { status: 400, message: 'Incorrect email or password combination'};
        }
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

  authenticateTwoFA(username: string, password: string): Promise<any> {
    return this.wsp.authenticateTwoFA({ application: 'Desktop', password, username });
  }

  async loginTwoFA(username: string, password: string, otp: string, token: string, userType: string): Promise<User> {
    const userFromApi: UserFromApiModel = await this.wsp.loginTwoFA(username, password, otp, token, userType, "Desktop");
    const user = this.formatLoginUser({ ...userFromApi, username });
    user.passwordResetRequired = userFromApi.user.passwordResetRequired;
    this.userService.setUser(user);
    return user;
  }

  deAuthenticate(token: string): Promise<void> {
    return this.wsp.deAuthenticate(token);
  }

  formatUser(user: UserFromApi): User {
    const clientId = parseInt(user.clientid),
      firstName = user.firstname,
      id = parseInt(user.id),
      lastName = user.lastname;
    const pinnaklClientName = user?.pinnaklClientName;
    const newUser = new User(
      !isNaN(clientId) ? clientId : null,
      user.features ? user.features.split(',') : [],
      firstName,
      `${firstName} ${lastName}`,
      !isNaN(id) ? id : null,
      lastName,
      user.token,
      user.username,
      null,
      null,
      null,
      pinnaklClientName
    );
    newUser.applicationAccessLevel = user.applicationaccesslevel;
    return newUser;
  }

  formatLoginUser({ user, token, username }: UserFromApiModel & { username: string }): User {
    const lastName = user.lastName;
    const firstName = user.firstName;
    const id = parseInt(user.id, 10);
    const clientId = parseInt(user.clientId, 10);
    const pinnaklClientName = user?.pinnaklClientName;
    return new User(
      !isNaN(clientId) ? clientId : null,
      user.features,
      firstName,
      `${firstName} ${lastName}`,
      !isNaN(id) ? id : null,
      lastName,
      token,
      username,
      null,
      null,
      null,
      pinnaklClientName
    );
  }

  getStoredUserName(): string {
    return localStorage.getItem('name') === 'null' ? null : localStorage.getItem('name');
  }

  async logout(isSsoEnabled: boolean = false): Promise<void> {
    const user = this.userService.getUser();
    const name = localStorage.getItem('name');
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('name', name);
    this._pinnaklHttpService.clearToken();
    if (!user) {
      this.store.dispatch(ClearStore());
      await this.router.navigate(['/login']);
      return;
    }
    if (!isSsoEnabled) {
      await this.wsp.deAuthenticate(user.token);
    }
    await this.router.navigate(['/login']);
    this.store.dispatch(ClearStore());
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
