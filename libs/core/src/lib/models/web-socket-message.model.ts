import {
  DeleteWebRequest,
  GetWebRequest,
  PostWebRequest,
  PutWebRequest,
  WebRequestPayload
} from './web-request.model';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type ExcludePayload<T extends { payload: WebRequestPayload }> = Omit<
  T,
  'payload'
>;

type PayloadAsArray<T extends { payload: WebRequestPayload }> = ExcludePayload<
  T
> & {
  payload: WebRequestPayload[];
};

export interface GetWebSocketMessage extends GetWebRequest {
  action: 'GET';
}

export interface PostWebSocketMessage extends PayloadAsArray<PostWebRequest> {
  action: 'POST';
}

export interface PutWebSocketMessage extends PayloadAsArray<PutWebRequest> {
  action: 'PUT';
}

export interface DeleteWebSocketMessage
  extends PayloadAsArray<DeleteWebRequest> {
  action: 'DELETE';
}

export interface AuthWebSocketMessage {
  action: 'AUTH';
  headers: {
    application: string;
    password: string;
    requestId: string;
    username: string;
  };
}

export interface DeAuthWebSocketMessage {
  action: 'DEAUTH';
  headers: {
    usertoken: string;
  };
}

interface UrlPayload {
  url: string;
}

export interface SubscribeWebSocketMessage {
  action: 'SUBSCRIBE';
  endPoint: '';
  payload: UrlPayload[];
}

export interface UnsubscribeWebSocketMessage {
  action: 'UNSUBSCRIBE';
  endPoint: '';
  payload: UrlPayload[];
}

export type WebSocketMessage =
  | ((
      | GetWebSocketMessage
      | PostWebSocketMessage
      | PutWebSocketMessage
      | DeleteWebSocketMessage
      | SubscribeWebSocketMessage
      | UnsubscribeWebSocketMessage
      | DeAuthWebSocketMessage
    ) & {
      headers: { requestId: string; token: string };
    })
  | AuthWebSocketMessage;
