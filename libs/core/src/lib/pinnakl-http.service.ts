import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import { AuthenticationParameters } from './authentication-parameters.model';
import { HTTP_SERVER_URL } from './environment.tokens';
import {
  DeleteHttpRequest,
  GetHttpRequest,
  PostHttpRequest,
  PutHttpRequest
} from './models';

const enum REQUEST_TYPE {
  GET = 'get',
  PUT = 'put',
  POST = 'post',
  DELETE = 'delete'
}

@Injectable()
export class PinnaklHttpService {
  private _token: string | null = null;
  private readonly resetPasswordApiUrl = 'forgotpassword';

  constructor(
    @Inject(HTTP_SERVER_URL) private readonly _HTTP_URL: string,
    private readonly _http: HttpClient,
    private readonly router: Router
  ) { }

  clearToken(): void {
    this._token = null;
  }

  authenticate(body: AuthenticationParameters): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.sendHttpRequest<any>(REQUEST_TYPE.POST, 'auth', { body })
        .subscribe(
          r => resolve(r),
          error => {
            console.log('Error in authenticate request', error);
            reject(error);
          });
    });
  }

  authenticateTwoFA(authenticationParameters: AuthenticationParameters): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.sendHttpRequest<any>(REQUEST_TYPE.POST, '2fa', {
        body: authenticationParameters
      })
        .subscribe(
          r => resolve(r),
          error => {
            console.log('Error in 2FA auth request', error);
            reject(error);
          });
    });
  }

  loginTwoFA(username: string, password: string, otp: string, token: string, userType: string, application: string): Promise<any> {
    let url = `2fa`;
    let body: {
      username?: string,
      password?: string,
      otp?: string,
      userType?: string
      application?: string
    } = { username, password, otp, application, userType };
    let type = REQUEST_TYPE.POST;
    if (token) {
      url = `2fa?token=${token}&otp=${otp}`;
      body = {};
      type = REQUEST_TYPE.GET;
    }
    return new Promise<any>((resolve, reject) => {
      this.sendHttpRequest<any>(type, url, { body })
        .subscribe(
          r => resolve(r),
          error => {
            console.log('Error in 2FA auth request', error);
            reject(error);
          });
    });
  }

  getQrSecret(username: string, password: string, userType: string, application: string): Promise<any> {
    const endpoint = `2fa/secret`;
    return new Promise<any>((resolve, reject) => {
      this.sendHttpRequest<any>(REQUEST_TYPE.POST, endpoint, { body: { username, password, application, userType } }).subscribe(
        r => resolve(r),
        error => {
          console.log('Error in 2FA auth request', error);
          reject(error);
        });
    });
  }

  forgotPassword(email: string): Promise<any> {
    const endpoint = `${this.resetPasswordApiUrl}?email=${email}`;
    return new Promise<any>((resolve, reject) => {
      this.sendHttpRequest<any>(REQUEST_TYPE.GET, endpoint, {})
        .subscribe(
          r => resolve(r),
          error => {
            console.log('Error forgot password request', error);
            reject(error);
          });
    });
  }

  deAuthenticate(token: string): Promise<any> {
    if (token) {
      return new Promise<any>((resolve, reject) => {
        this.sendHttpRequest<any>(REQUEST_TYPE.DELETE, 'auth', { headers: { Authorization: token } })
          .subscribe(
            r => resolve(r),
            error => {
              console.log('Error in get request', error);
              reject(error);
            });
      });
    }
    throw new Error('TOKEN IS INVALID');
  }

  delete<T>({ endpoint, body }: DeleteHttpRequest): Promise<T> {
    const token = this.getToken();
    if (token) {
      return new Promise<any>((resolve, reject) => {
        this.sendHttpRequest<any>(REQUEST_TYPE.DELETE, endpoint, { headers: { Authorization: token }, body })
          .subscribe(
            r => resolve(r),
            error => {
              console.log('Error in delete request', error);
              this.handleAuthError(error);
              reject(error);
            });
      });
    }
    throw new Error('TOKEN IS INVALID');
  }

  get<T>({ params, endpoint }: GetHttpRequest): Promise<T> {
    if (params) {
      const paramsWithReplacedAmpersand = JSON.stringify(params).replace('&', '%26');
      endpoint = `${endpoint}?options=${encodeURI(paramsWithReplacedAmpersand)}`;
    }
    const token = this.getToken();
    if (token) {
      return new Promise<any>((resolve, reject) => {
        this.sendHttpRequest<any>(REQUEST_TYPE.GET, endpoint, { headers: { Authorization: token } })
          .subscribe(
            r => resolve(r),
            error => {
              console.log('Error in get request', error);
              this.handleAuthError(error);
              reject(error);
            });
      });
    }
    throw new Error('TOKEN IS INVALID');
  }

  post<T>({ body, endpoint }: PostHttpRequest): Promise<T> {
    const token = this.getToken();
    if (token) {
      return new Promise<any>((resolve, reject) => {
        this.sendHttpRequest<any>(REQUEST_TYPE.POST, endpoint, {
          headers: { Authorization: token },
          body: body
        })
          .subscribe(
            r => resolve(r),
            error => {
              console.log('Error in post request', error);
              this.handleAuthError(error);
              reject(error);
            });
      });
    }
    throw new Error('TOKEN IS INVALID');
  }

  put<T>({ endpoint, body }: PutHttpRequest): Promise<T> {
    const token = this.getToken();
    if (token) {
      return new Promise<any>((resolve, reject) => {
        this.sendHttpRequest<any>(REQUEST_TYPE.PUT, endpoint, {
          headers: { Authorization: token },
          body: body
        })
          .subscribe(
            r => resolve(r),
            error => {
              console.log('Error in put request', error);
              this.handleAuthError(error);
              reject(error);
            });
      });
    }
    throw new Error('TOKEN IS INVALID');
  }

  private sendHttpRequest<T>(
    type: REQUEST_TYPE,
    endpoint: string,
    data: { headers?: any, body?: any }
  ): Observable<T> {
    switch (type) {
      case 'get':
        return this._http.get<T>(
          `${this._HTTP_URL}/${endpoint}`,
          data.headers ? { headers: new HttpHeaders(data.headers) } : undefined
        );
      case 'delete':
        return this._http.delete<T>(
          `${this._HTTP_URL}/${endpoint}`,
          data.headers ? { headers: new HttpHeaders(data.headers) } : undefined
        );
      case 'put':
      case 'post':
        data.headers = {
          ...data.headers,
          'Content-Type': 'application/json'
        };
        return this._http[type]<T>(
          `${this._HTTP_URL}/${endpoint}`,
          JSON.stringify(data.body),
          data.headers ? { headers: new HttpHeaders(data.headers) } : undefined
        );
      default:
        throw new Error(`Request type ${type} is not supportable`);
    }
  }

  private getToken(): string | null {
    if (!this._token) {
      try {
        const userInSessionString = localStorage.getItem('user');
        const t = JSON.parse(userInSessionString).token;
        if (t) {
          this._token = t;
        }
      } catch (e) {
        console.log('Error', e);
        this._token = null;
        this.router.navigate(['/login']);
      }
    }
    return this._token;
  }

  private handleAuthError(error: any): void {
    if (error.status === 401 || error.status === 403) {
      this.clearToken();
      console.log('Unauthorized', error.status);
      const name = localStorage.getItem('name');
      localStorage.clear();
      localStorage.setItem('name', name);
      this.router.navigate(['/login']);
    }
  }
}
