import { Injectable } from '@angular/core';
import { getBooleanFromString, User, WebServiceProvider } from '@pnkl-frontend/core';
import { isEmpty } from 'lodash';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AccessControlService {
  private readonly _usersEndpoint = 'entities/users';
  constructor(private readonly wsp: WebServiceProvider) { }

  getAccessControlUsers(): Observable<User[]> {
    return from(this.wsp.getHttp<any[]>({
      endpoint: this._usersEndpoint,
      params: {
        fields: ['applicationaccesslevel', 'tradingaccess', 'firstname', 'lastname', 'tokenReAuthInterval', 'authType', 'otpchannel', 'email', 'phone', 'clientAdmin'],
        filters: [
          {
            key: 'isDevUser',
            type: 'EQ',
            value: ['0']
          }
        ]
      },
    })).pipe(map((users => !isEmpty(users) ? this.setUsersFromApi(users) : null)));
  }

  setUsersFromApi(usersFromApi: any[]): User[] {
    return usersFromApi.map((userFromApi) => {
      const user = new User(
        userFromApi?.clientid,
        userFromApi?.features?.split(','),
        userFromApi.firstname,
        `${userFromApi.firstname || ''} ${userFromApi.lastname || ''}`,
        !isNaN(userFromApi.id) ? userFromApi.id : null,
        userFromApi.lastname,
        '',
        userFromApi?.username,
        userFromApi?.email,
        userFromApi?.phone,
        userFromApi?.otpChannel,
        userFromApi?.pinnaklClientName
      );

      user.authType = userFromApi.authtype;
      user.otpChannel = userFromApi.otpchannel;
      user.clientAdmin = getBooleanFromString(userFromApi.clientadmin);
      user.tradingAccess = getBooleanFromString(userFromApi.tradingaccess);
      user.applicationAccessLevel = userFromApi.applicationaccesslevel;

      return user;
    });
  }
}
