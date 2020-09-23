interface WebRequestBase {
  endPoint: string;
}

export interface WebSocketMessageFilter {
  key: string;
  type:
    | 'EQ'
    | 'NE'
    | 'LT'
    | 'LE'
    | 'GT'
    | 'GE'
    | 'IN'
    | 'LIKE'
    | 'RANGE'
    | 'TOP';
  value: string[]; // Has to be an array because of LIKE
}

interface WebSocketMessageSortParameter {
  field: string;
  direction: 'ASC' | 'DESC';
}

interface GetWebRequestOptions {
  fields?: string[];
  filters?: WebSocketMessageFilter[];
  orderBy?: WebSocketMessageSortParameter[];
}

interface WebRequestFilter {
  filters?: WebSocketMessageFilter[];
}

// export interface WebRequestPayload {
//   [key: string]: string;
// }
// TODO: Change this back to the commented line above, TS 3.1 supports it
export type WebRequestPayload = any;

export interface GetWebRequest extends WebRequestBase {
  options?: ({ id: string }) | GetWebRequestOptions;
}

export interface PostManyWebRequest extends WebRequestBase {
  payload: WebRequestPayload[];
}

export interface PostWebRequest extends WebRequestBase {
  payload: WebRequestPayload;
}

export interface PutWebRequest extends WebRequestBase {
  payload: WebRequestPayload;
  options?: WebRequestFilter;
}

export interface DeleteWebRequest extends WebRequestBase {
  payload: WebRequestPayload & { id: string };
  options?: WebRequestFilter;
}
