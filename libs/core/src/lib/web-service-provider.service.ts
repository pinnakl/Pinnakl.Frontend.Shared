// tslint:disable:no-console
import { Inject, Injectable } from '@angular/core';

import { Observable, Observer, Subject } from 'rxjs';
import { filter, map, multicast, refCount } from 'rxjs/operators';

import { AuthenticationParameters } from './authentication-parameters.model';
import {
  PRODUCTION,
  REQUEST_TIMEOUT_PERIOD as REQUEST_TIMEOUT_PERIOD_TOKEN
} from './environment.tokens';
import {
  DeleteWebRequest,
  GetWebRequest,
  PostManyWebRequest,
  PostWebRequest,
  PutWebRequest,
  SubscriptionResponse
} from './models';

import { PinnaklWebSocketService } from './pinnakl-web-socket.service';
class PinnaklWebSocketResponse {
  uri: string;
  body: object[];
}

@Injectable()
export class WebServiceProvider {
  // private readonly DEV_MODE = !environment.production;
  // private readonly REQUEST_TIMEOUT_PERIOD = environment.requestTimeoutPeriod;

  set unauthorizedRequestHandler(value: () => Promise<void>) {
    this._unauthorizedRequestHandler = value;
  }

  constructor(
    private pnklWebSocketService: PinnaklWebSocketService,
    @Inject(PRODUCTION) private DEV_MODE: boolean,
    @Inject(REQUEST_TIMEOUT_PERIOD_TOKEN) private REQUEST_TIMEOUT_PERIOD: number
  ) {}
  private _unauthorizedRequestHandler: () => Promise<void>;

  private static getActionFromUri(uri: string): 'DELETE' | 'NOTIFY' | 'POST' | 'PUT' {
    if (uri.includes('PUT')) {
      return 'PUT';
    } else if (uri.includes('POST')) {
      return 'POST';
    } else if (uri.includes('DELETE')) {
      return 'DELETE';
    } else if (uri.includes('NOTIFY')) {
      return 'NOTIFY';
    }
    throw new Error('Invalid Action');
  }

  authenticate({
    application,
    password,
    username
  }: AuthenticationParameters): Promise<any> {
    return new Promise((resolve, reject) => {
      let responseReceived = false;
      setTimeout(() => {
        if (responseReceived) {
          return;
        }
        const errorMessage = `TIMEOUT: AUTHENTICATE Username:${username} Password:${password}`;
        reject({
          clientMessage: 'Operation timed out',
          errorMessage
        });
        if (this.DEV_MODE) {
          console.error(errorMessage);
        }
      }, this.REQUEST_TIMEOUT_PERIOD);
      this.pnklWebSocketService
        .authenticate({ application, password, username })
        .then(response => {
          resolve(response.body[0]);
          responseReceived = true;
          if (this.DEV_MODE) {
            console.info(
              `AUTHENTICATE Username:${username} Password:${password}`
            );
            console.log(response.body);
          }
        })
        .catch(error => {
          reject(error.body[0]);
          responseReceived = true;
          if (this.DEV_MODE) {
            console.info(
              `AUTHENTICATE Username:${username} Password:${password}`
            );
            console.error(error.body[0]);
          }
        });
    });
  }

  deAuthenticate(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let responseReceived = false;
      setTimeout(() => {
        if (responseReceived) {
          return;
        }
        const errorMessage = `TIMEOUT: DE-AUTHENTICATE token: ${token}`;
        reject({
          clientMessage: 'Operation timed out',
          errorMessage
        });
        if (this.DEV_MODE) {
          console.error(errorMessage);
        }
      }, this.REQUEST_TIMEOUT_PERIOD);
      this.pnklWebSocketService
        .deAuthenticate(token)
        .then(() => {
          resolve();
          responseReceived = true;
          if (this.DEV_MODE) {
            console.info(`DE-AUTHENTICATE token: ${token}`);
          }
        })
        .catch(error => {
          reject(error.body[0]);
          responseReceived = true;
          if (this.DEV_MODE) {
            console.info(`DE-AUTHENTICATE token: ${token}`);
            console.error(error.body[0]);
          }
        });
    });
  }

  delete(deleteWebRequest: DeleteWebRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      let responseReceived = false;
      setTimeout(() => {
        if (responseReceived) {
          return;
        }
        const errorMessage = `TIMEOUT: DELETE ${deleteWebRequest.endPoint}`;
        reject({
          clientMessage: 'Operation timed out',
          errorMessage
        });
        if (this.DEV_MODE) {
          console.error(errorMessage);
        }
      }, this.REQUEST_TIMEOUT_PERIOD);
      this.pnklWebSocketService
        .delete(deleteWebRequest)
        .then(response => {
          resolve(response.body[0]);
          responseReceived = true;
          if (this.DEV_MODE) {
            console.info(`DELETE ${deleteWebRequest.endPoint}`);
            console.log(response.body[0]);
          }
        })
        .catch(error => {
          reject(error.body[0]);
          responseReceived = true;
          if (this.DEV_MODE) {
            console.info(`DELETE ${deleteWebRequest.endPoint}`);
            console.error(error.body[0]);
          }
        });
    });
  }

  get(getWebRequest: GetWebRequest, ignoreTimeout?: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      let responseReceived = false;
      setTimeout(() => {
        if (responseReceived || ignoreTimeout) {
          return;
        }
        const errorMessage = `TIMEOUT: GET ${getWebRequest.endPoint}`;
        reject({
          clientMessage: 'Operation timed out',
          errorMessage
        });
        if (this.DEV_MODE) {
          console.error(errorMessage);
        }
      }, this.REQUEST_TIMEOUT_PERIOD);
      this.pnklWebSocketService
        .get(getWebRequest)
        .then(response => {
          resolve(response.body);
          responseReceived = true;
          if (this.DEV_MODE) {
            console.info(`GET ${getWebRequest.endPoint}`);
            console.log(response.body);
          }
        })
        .catch(async error => {
          if (error) {
            const { body } = error;
            if (this._unauthorizedRequestHandler) {
              const message = body && body[0] ? body[0].message : '';
              if (
                message &&
                (message.includes('not authorized') ||
                  message.includes('Invalid or expired authentication token'))
              ) {
                await this._unauthorizedRequestHandler();
              }
            }
            reject(error.body[0]);
            responseReceived = true;
            if (this.DEV_MODE) {
              console.info(`GET ${getWebRequest.endPoint}`);
              console.error(error.body[0]);
            }
          }
        });
    });
  }

  post(postWebRequest: PostWebRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      let responseReceived = false;
      setTimeout(() => {
        if (responseReceived) {
          return;
        }
        const errorMessage = `TIMEOUT: POST ${postWebRequest.endPoint}`;
        reject({
          clientMessage: 'Operation timed out',
          errorMessage
        });
        if (this.DEV_MODE) {
          console.error(errorMessage);
        }
      }, this.REQUEST_TIMEOUT_PERIOD);
      this.pnklWebSocketService
        .post(postWebRequest)
        .then(response => {
          resolve(response.body[0]);
          responseReceived = true;
          if (this.DEV_MODE) {
            console.info(`POST ${postWebRequest.endPoint}`);
            console.log(response.body[0]);
          }
        })
        .catch(error => {
          reject(error.body[0]);
          responseReceived = true;
          if (this.DEV_MODE) {
            console.info(`POST ${postWebRequest.endPoint}`);
            console.error(error.body[0]);
          }
        });
    });
  }

  postMany(postManyWebRequest: PostManyWebRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      let responseReceived = false;
      setTimeout(() => {
        if (responseReceived) {
          return;
        }
        const errorMessage = `TIMEOUT: POST ${postManyWebRequest.endPoint}`;
        reject({
          clientMessage: 'Operation timed out',
          errorMessage
        });
        if (this.DEV_MODE) {
          console.error(errorMessage);
        }
      }, this.REQUEST_TIMEOUT_PERIOD);
      this.pnklWebSocketService
        .postMany(postManyWebRequest)
        .then(response => {
          resolve(response.body[0]);
          responseReceived = true;
          if (this.DEV_MODE) {
            console.info(`POST ${postManyWebRequest.endPoint}`);
            console.log(response.body[0]);
          }
        })
        .catch(error => {
          reject(error.body[0]);
          responseReceived = true;
          if (this.DEV_MODE) {
            console.info(`POST ${postManyWebRequest.endPoint}`);
            console.error(error.body[0]);
          }
        });
    });
  }

  put(putWebRequest: PutWebRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      let responseReceived = false;
      setTimeout(() => {
        if (responseReceived) {
          return;
        }
        const errorMessage = `TIMEOUT: PUT ${putWebRequest.endPoint}`;
        reject({
          clientMessage: 'Operation timed out',
          errorMessage
        });
        if (this.DEV_MODE) {
          console.error(errorMessage);
        }
      }, this.REQUEST_TIMEOUT_PERIOD);
      this.pnklWebSocketService
        .put(putWebRequest)
        .then(response => {
          resolve(response.body[0]);
          responseReceived = true;
          if (this.DEV_MODE) {
            console.info(`PUT ${putWebRequest.endPoint}`);
            console.log(response.body[0]);
          }
        })
        .catch(error => {
          reject(error.body[0]);
          responseReceived = true;
          if (this.DEV_MODE) {
            console.info(`PUT ${putWebRequest.endPoint}`);
            console.error(error.body[0]);
          }
        });
    });
  }

  subscribe(uri: string): Observable<SubscriptionResponse<object>> {
    const wsObservable: Observable<PinnaklWebSocketResponse> = new Observable(
      (observer: Observer<PinnaklWebSocketResponse>) => {
        if (this.DEV_MODE) {
          console.info(`SUB ${uri}`);
        }
        this.pnklWebSocketService.sub(uri);
        this.pnklWebSocketService.setNotify(result => {
          observer.next(result);
          if (this.DEV_MODE) {
            console.info(uri);
            console.log(result.body);
          }
        });
        return () => {
          if (this.DEV_MODE) {
            console.info(`UNSUB ${uri}`);
          }
          this.pnklWebSocketService.unsub(uri);
        };
      }
    );
    return wsObservable.pipe(
      filter(result => result.uri.includes(uri)),
      map(result => {
        const response = new SubscriptionResponse<object>();
        response.action = WebServiceProvider.getActionFromUri(result.uri);
        response.body = result.body[0];
        return response;
      })
    );
  }

  subscribeToMany(uris: string[]): Observable<SubscriptionResponse<object>>[] {
    const wsObservable: Observable<PinnaklWebSocketResponse> = new Observable(
      (observer: Observer<PinnaklWebSocketResponse>) => {
        if (this.DEV_MODE) {
          console.info(`SUB ${uris}`);
        }
        this.pnklWebSocketService.subToMany(uris);
        this.pnklWebSocketService.setNotify(result => {
          observer.next(result);
          if (this.DEV_MODE) {
            console.info(result.uri);
            console.log(result.body);
          }
        });
        return () => {
          if (this.DEV_MODE) {
            console.info(`UNSUB ${uris}`);
          }
          this.pnklWebSocketService.unsubFromMany(uris);
        };
      }
    );
    const subject = new Subject<PinnaklWebSocketResponse>(),
      refCounted = wsObservable.pipe(multicast(subject), refCount());
    return uris.map(uri =>
      refCounted.pipe(
        filter(result => result.uri.includes(uri)),
        map(result => {
          const response = new SubscriptionResponse<object>();
          response.action = WebServiceProvider.getActionFromUri(result.uri);
          response.body = result.body[0];
          return response;
        })
      )
    );
  }
}
