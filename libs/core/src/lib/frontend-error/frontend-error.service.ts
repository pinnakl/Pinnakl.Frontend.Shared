import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

import * as moment from 'moment';

import { FRONT_END_ERROR_SERVICE_URL } from '../environment.tokens';
import { UserService } from '../user.service';

interface FrontEndError {
  clientId?: number;
  error: string;
  errorDate: string;
  route: string;
  userToken?: string;
  userId?: number;
}

@Injectable()
export class FrontendErrorService {
  constructor(
    private _http: HttpClient,
    private _userService: UserService,
    @Inject(FRONT_END_ERROR_SERVICE_URL)
    private FRONT_END_ERROR_RESOURCE_URL: string
  ) {}
  handleError(error: any): void {
    console.error(error);
    const frontEndError = this._constructFrontEndError(error);
    if (
      frontEndError.error
        .toLowerCase()
        .includes('Invalid or expired authentication token'.toLowerCase()) ||
      frontEndError.error
        .toLowerCase()
        .includes(
          'FirebaseError: Messaging: Notifications have been blocked'.toLowerCase()
        ) ||
      frontEndError.error
        .toLowerCase()
        .includes('Operation Timed out'.toLowerCase())
    ) {
      return;
    }
    this._handleFrontError(frontEndError);
  }

  private _constructFrontEndError(error: any): FrontEndError {
    const errorString = this._getFormattedError(error);
    let frontEndError: FrontEndError = {
      error: errorString,
      errorDate: moment.utc().format('MM/DD/YYYY hh:mm:ss a'),
      route: location.hash
    };
    const user = this._userService.getUser();
    if (user) {
      frontEndError = {
        ...frontEndError,
        clientId: user.clientId,
        userToken: user.token,
        userId: user.id
      };
    }
    return frontEndError;
  }

  private _getFormattedError(error: any): string {
    if (error instanceof Error) {
      const { message, stack } = error;
      return JSON.stringify({ message, stack });
    }
    try {
      return JSON.stringify(error);
    } catch {}
    try {
      const errorFormatted = Object.getOwnPropertyNames(error)
        .filter(propertyName => {
          try {
            error[propertyName].toString();
            return true;
          } catch {
            return false;
          }
        })
        .map(propertyName => ({
          [propertyName]: error[propertyName].toString()
        }))
        .reduce(
          (formattedResult, propertyNameWithValue) => ({
            ...formattedResult,
            ...propertyNameWithValue
          }),
          {}
        );
      return JSON.stringify(errorFormatted);
    } catch {}
    return JSON.stringify({ message: 'Unable to parse error' });
  }

  private _handleFrontError(frontEndError: FrontEndError): void {
    this._http
      .post<any>(this.FRONT_END_ERROR_RESOURCE_URL, frontEndError)
      .toPromise()
      .catch(reason => {
        console.error('[FrontEndErrorService] POST failed, reason:', reason);
      });
  }
}
