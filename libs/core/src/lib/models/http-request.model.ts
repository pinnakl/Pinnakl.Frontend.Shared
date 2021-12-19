export interface HttpRequest {
  endpoint: string;
}

export interface GetHttpRequest extends HttpRequest {
  params?: Record<string, any>;
}

export interface PutHttpRequest extends HttpRequest {
  body?: Record<string, any>;
}

export interface PostHttpRequest extends HttpRequest {
  body?: Record<string, any>;
}

export interface DeleteHttpRequest extends HttpRequest {
  body?: Record<string, any>;
}
