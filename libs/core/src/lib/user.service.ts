import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { getBooleanFromString } from './helpers';
import { User } from './models';
import { WebServiceProvider } from './web-service-provider.service';

@Injectable()
export class UserService {
  isResetPassword$ = new BehaviorSubject<{isLoginPass: boolean, isPageReady: boolean}>({isLoginPass: false, isPageReady: false});

  private readonly _usersEndpoint = 'entities/users';
  private readonly _crm_blocked_ips = 'entities/crm_blocked_ips';
  constructor(private readonly wsp: WebServiceProvider) {}

  getUser(): User | null {
    const userInSession = localStorage.getItem('user');
    return userInSession ? JSON.parse(userInSession) : null;
  }
  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('name', user.firstName);
  }

  async getBlockedIps() {
    const blockedIps = await this.wsp.getHttp<any[]>({
      endpoint: 'entities/crm_blocked_ips',
      params: {
        fields: [ 'id', 'ipaddress' ],
      }
    });
    return blockedIps;
  }

  async postBlockedIps(payload) {
    const blockedIps = await this.wsp.postHttp<any[]>({
      endpoint: this._crm_blocked_ips,
      body: payload
    });
    return blockedIps;
  }

  async removeBlockedIps(ipId) {
    const blockedIps = await this.wsp.deleteHttp<any[]>({
      endpoint: `${this._crm_blocked_ips}/${ipId}`
    });
    return blockedIps;
  }

  async getFullUserData(id: number): Promise<User> {
    const users = await this.wsp.getHttp<any[]>({
      endpoint: this._usersEndpoint,
      params: {
        fields: [ 'otpchannel', 'authtype', 'clientadmin', 'clientid', 'email', 'firstname', 'id', 'isdevuser', 'tokenreauthinterval',
          'lastname', 'newarchitecture', 'password', 'phone', 'roleid', 'timezone', 'tradingaccess', 'username' ],
        filters: [
          {
            key: 'id',
            type: 'EQ',
            value: [id.toString()]
          }
        ]
      }
    });

    const userFromApi = (Array.isArray(users) && users.length > 0) ? users[0] : null;

    if (userFromApi) {
      return this.setUserFromApi(userFromApi);
    }

    return userFromApi;
  }

  async getFullUserDataByEmail(email: string): Promise<User> {
    const users = await this.wsp.getHttp<any[]>({
      endpoint: this._usersEndpoint,
      params: {
        fields: [ 'otpchannel', 'authtype', 'clientadmin', 'clientid', 'email', 'firstname', 'id', 'isdevuser', 'tokenreauthinterval',
          'lastname', 'newarchitecture', 'password', 'phone', 'roleid', 'timezone', 'tradingaccess', 'username' ],
        filters: [
          {
            key: 'email',
            type: 'EQ',
            value: [email]
          }
        ]
      }
    });

    const userFromApi = (Array.isArray(users) && users.length > 0) ? users[0] : null;

    if (userFromApi) {
      return this.setUserFromApi(userFromApi);
    }

    return userFromApi;
  }

  putUser(putJson: any): Promise<User> {
    return this.wsp.putHttp({ endpoint: this._usersEndpoint, body: putJson });
  }

  // tslint:disable-next-line:typedef
  setUserFromApi(userFromApi): User {
    const user = new User(
      userFromApi.clientid,
      userFromApi.features?.split(','),
      userFromApi.firstname,
      `${userFromApi.firstname || ''} ${userFromApi.lastname || ''}`,
      !isNaN(userFromApi.id) ? userFromApi.id : null,
      userFromApi.lastname,
      '',
      userFromApi.username,
      null,
      null,
      null,
      userFromApi?.pinnaklClientName
    );

    user.email = userFromApi.email;
    user.phone = userFromApi.phone;
    user.authType = userFromApi.authtype;
    user.clientAdmin = getBooleanFromString(userFromApi.clientadmin);
    user.tradingAccess = getBooleanFromString(userFromApi.tradingaccess);
    user.otpChannel = userFromApi['otpchannel'];
    user.tokenReAuthInterval = userFromApi['tokenreauthinterval'];
    user.timezone = userFromApi.timezone;
    user.isDevUser = getBooleanFromString(userFromApi.isdevuser);

    return user;
  }

  validateUserResetPasswordModal(): void {
    const resetPassword = this.isResetPassword$.getValue();

    if (resetPassword.isLoginPass && !resetPassword.isPageReady) {
      this.isResetPassword$.next({isLoginPass: true, isPageReady: true});
    }
  }
}
