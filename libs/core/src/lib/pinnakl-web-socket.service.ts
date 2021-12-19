import { Injectable } from '@angular/core';

import { AuthenticationParameters } from './authentication-parameters.model';
import {
  AuthWebSocketMessage,
  DeAuthWebSocketMessage,
  DeleteWebRequest,
  DeleteWebSocketMessage,
  GetWebRequest,
  GetWebSocketMessage,
  PostManyWebRequest,
  PostWebRequest,
  PostWebSocketMessage,
  PutWebRequest,
  PutWebSocketMessage,
  SubscribeWebSocketMessage,
  UnsubscribeWebSocketMessage,
  WebSocketMessage
} from './models';

// Making ws to outside of class so that single variable will be used for all instances of this service
let _currentRequestId = 0,
  _creatingWebSocket = false,
  _notify: (result: { uri: string; body: object }) => void,
  _onClose: () => void,
  _onReconnect: () => void,
  _promises = {},
  _retryCount = 0,
  _serverURL: string,
  _ws: WebSocket;

interface ResolveArgument {
  body: object[];
  uri: string;
}

@Injectable()
export class PinnaklWebSocketService {
  private NEW_LINE_CHAR = '\r\n';
  private get ws(): Promise<WebSocket> {
    if (!_ws) {
      return this.startWebSocket().then(() => _ws);
    }
    return Promise.resolve(_ws);
  }

  authenticate(
    authenticationParameters: AuthenticationParameters
  ): Promise<any> {
    const authWebSocketMessage: AuthWebSocketMessage = {
      action: 'AUTH',
      headers: <any>authenticationParameters
    };
    return this.sendRequest(authWebSocketMessage);
  }

  deAuthenticate(token: string): Promise<any> {
    const deAuthWebSocketMessage: DeAuthWebSocketMessage = {
      action: 'DEAUTH',
      headers: { usertoken: token }
    };
    return this.sendRequest(deAuthWebSocketMessage);
  }

  delete(deleteWebRequest: DeleteWebRequest): Promise<any> {
    const deleteWebSocketMessage: DeleteWebSocketMessage = {
      action: 'DELETE',
      endPoint: deleteWebRequest.endPoint,
      payload: [deleteWebRequest.payload]
    };
    if (deleteWebRequest.options) {
      deleteWebSocketMessage.options = deleteWebRequest.options;
    }
    return this.sendRequest(deleteWebSocketMessage);
  }

  enableReconnect(): void {
    const onClose = () => {
      if (_onClose) {
        _onClose();
      }
      const start = () => {
        this.startWebSocket()
          .then(() => {
            if (_onReconnect) {
              _onReconnect();
            }
            this.ws.then(webSocket => (webSocket.onclose = onClose));
          })
          .catch(() => setTimeout(() => start(), 2000));
      };
      start();
    };
    this.ws
      .then(webSocket => (webSocket.onclose = onClose))
      .catch(() => onClose());
  }

  get(getWebRequest: GetWebRequest): Promise<any> {
    const getWebSocketMessage: GetWebSocketMessage = {
      action: 'GET',
      endPoint: getWebRequest.endPoint,
      options: getWebRequest.options
    };
    return this.sendRequest(getWebSocketMessage);
  }

  post(postWebRequest: PostWebRequest): Promise<any> {
    const postWebSocketMessage: PostWebSocketMessage = {
      action: 'POST',
      endPoint: postWebRequest.endPoint,
      payload: [postWebRequest.payload]
    };
    return this.sendRequest(postWebSocketMessage);
  }

  postMany(postManyWebRequest: PostManyWebRequest): Promise<any> {
    const postWebSocketMessage: PostWebSocketMessage = {
      action: 'POST',
      endPoint: postManyWebRequest.endPoint,
      payload: postManyWebRequest.payload
    };
    return this.sendRequest(postWebSocketMessage);
  }

  put(putWebRequest: PutWebRequest): Promise<any> {
    const putWebSocketMessage: PutWebSocketMessage = {
      action: 'PUT',
      endPoint: putWebRequest.endPoint,
      payload: [putWebRequest.payload]
    };
    if (putWebRequest.options) {
      putWebSocketMessage.options = putWebRequest.options;
    }
    return this.sendRequest(putWebSocketMessage);
  }

  setNotify(notify: (result: ResolveArgument) => void): void {
    _notify = notify;
  }

  setOnClose(onClose: () => void): void {
    _onClose = onClose;
  }

  setOnReconnect(onReconnect: () => void): void {
    _onReconnect = onReconnect;
  }

  setServerURL(url: string): void {
    _serverURL = url;
  }

  sub(url: string): void {
    const subscribeWebSocketMessage: SubscribeWebSocketMessage = {
      action: 'SUBSCRIBE',
      endPoint: '',
      payload: [{ url }]
    };
    this.sendRequest(subscribeWebSocketMessage);
  }

  subToMany(urls: string[]): void {
    const subscribeWebSocketMessage: SubscribeWebSocketMessage = {
      action: 'SUBSCRIBE',
      endPoint: '',
      payload: urls.map(url => ({ url }))
    };
    this.sendRequest(subscribeWebSocketMessage);
  }

  unsub(url: string): void {
    const unsubscribeWebSocketMessage: UnsubscribeWebSocketMessage = {
      action: 'UNSUBSCRIBE',
      endPoint: '',
      payload: [{ url }]
    };
    this.sendRequest(unsubscribeWebSocketMessage);
  }

  unsubFromMany(urls: string[]): void {
    const unsubscribeWebSocketMessage: UnsubscribeWebSocketMessage = {
      action: 'UNSUBSCRIBE',
      endPoint: '',
      payload: urls.map(url => ({ url }))
    };
    this.sendRequest(unsubscribeWebSocketMessage);
  }

  private getPromiseId(): number {
    _currentRequestId++;
    if (_currentRequestId > 10000) {
      _currentRequestId = 0;
    }
    return _currentRequestId;
  }

  private getResolveArgumentObject(messageArray: string[]): ResolveArgument {
    const result = JSON.parse(messageArray[messageArray.length - 1]);
    return {
      uri: messageArray[0],
      body: result
    };
  }

  private getRequestId(messageArray: string[]): number {
    const requestHdr = JSON.parse(messageArray[1]);
    return requestHdr.requestid;
  }

  private getToken(): string | null {
    const userInSessionString = localStorage.getItem('user');
    return userInSessionString ? JSON.parse(userInSessionString).token : null;
  }

  private onMessage(event: MessageEvent): void {
    const msg: string = event.data.toString(),
      promises = _promises;
    if (/^OK AUTH/i.test(msg)) {
      const responseMessages = msg.split(this.NEW_LINE_CHAR),
        reqId = this.getRequestId(responseMessages);
      if (promises.hasOwnProperty(reqId)) {
        promises[reqId].resolve(
          this.getResolveArgumentObject(responseMessages)
        );
        delete promises[reqId];
      }
    } else if (/^OK DEAUTH/i.test(msg)) {
      const responseMessages = msg.split(this.NEW_LINE_CHAR),
        reqId = this.getRequestId(responseMessages);
      if (promises.hasOwnProperty(reqId)) {
        promises[reqId].resolve();
        delete promises[reqId];
      }
    } else if (promises && /^ERROR /i.test(msg)) {
      const responseMessages = msg.split(this.NEW_LINE_CHAR),
        reqId = this.getRequestId(responseMessages);
      if (promises.hasOwnProperty(reqId)) {
        promises[reqId].reject(this.getResolveArgumentObject(responseMessages));
        delete promises[reqId];
      }
    } else if (promises && /^OK /i.test(msg)) {
      const responseMessages = msg.split(this.NEW_LINE_CHAR),
        reqId = this.getRequestId(responseMessages);
      if (promises.hasOwnProperty(reqId)) {
        promises[reqId].resolve(
          this.getResolveArgumentObject(responseMessages)
        );
        delete promises[reqId];
      }
    } else if (_notify && /^NOTIFY /i.test(msg)) {
      const responseMessages = msg.split(this.NEW_LINE_CHAR);
      _notify(this.getResolveArgumentObject(responseMessages));
    }
  }

  private sendRequest(
    socketMessage:
      | AuthWebSocketMessage
      | DeAuthWebSocketMessage
      | GetWebSocketMessage
      | PostWebSocketMessage
      | PutWebSocketMessage
      | DeleteWebSocketMessage
      | SubscribeWebSocketMessage
      | UnsubscribeWebSocketMessage,
    addPromise: boolean = true
  ): Promise<any> {
    const requestId = this.getPromiseId().toString();
    const headers: any =
      socketMessage.action === 'AUTH' || socketMessage.action === 'DEAUTH'
        ? { ...socketMessage.headers, requestId }
        : { requestId, token: this.getToken() };
    const webSocketMessage: WebSocketMessage = {
      ...socketMessage,
      headers
    };
    return this.ws.then(webSocketInstance => {
      webSocketInstance.send(JSON.stringify(webSocketMessage));
      // TODO: try to do something better than JSON.stringify
      return new Promise((resolve, reject) => {
        if (addPromise) {
          _promises[requestId] = {
            time: new Date(),
            resolve,
            reject
          };
        }
      });
    });
  }

  private startWebSocket(): Promise<{}> {
    return new Promise((resolve, reject) => {
      try {
        if (!_creatingWebSocket) {
          _creatingWebSocket = true;
          const socket = new WebSocket(_serverURL);
          socket.onopen = (event: Event) => {
            // eslint-disable-next-line no-console
            console.info('Connected to Server');
            _ws = <WebSocket>event.target;

            _ws.onmessage = (onMessageEvent: MessageEvent) =>
              this.onMessage(onMessageEvent);
            _creatingWebSocket = false;
            resolve({});
          };
          socket.onclose = (event: CloseEvent) => {
            _promises = {};
            _currentRequestId = 0;
            _creatingWebSocket = false;
            reject(event);
          };
        } else {
          const interval = setInterval(() => {
            if (_ws) {
              resolve({});
              clearInterval(interval);
              _retryCount = 0;
            } else if (_retryCount > 100) {
              reject();
              clearInterval(interval);
              _retryCount = 0;
            }
            _retryCount++;
          }, 100);
        }
      } catch (exception) {
        reject(exception);
      }
    });
  }
}
