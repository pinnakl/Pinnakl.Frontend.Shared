import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserAuthType } from '@pnkl-frontend/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HTTP_SERVICE_URL } from './enviroment.tokens';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  constructor(
    private readonly router: Router,
    @Inject(HTTP_SERVICE_URL) private readonly httpServiceUrl: string
  ) {}
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const userInSession: User = JSON.parse(localStorage.getItem('user'));
    const token: string = userInSession && userInSession['token'];

    // console.log('Prod value: ', this.PRODUCTION);
    // console.log('URL: ', request.url);

    const url = !request.url.includes('http')
      ? this.httpServiceUrl.concat(request.url)
      : request.url;
    request = request.clone({
      url: url
    });
    const { origin } = new URL(url);
    const is3rdPartyRequest = ['https://api.ipdata.co'].includes(origin);
    const isBackMiscService = origin.includes('backendmiscservice');
    // Omit modification of 3rd-party requests to prevent CORS errors
    if (!is3rdPartyRequest && !isBackMiscService) {
      if (token) {
        request = request.clone({
          headers: request.headers.set('Authorization', token)
        });
      }

      if (!request.headers.has('Content-Type')) {
        request = request.clone({
          headers: request.headers.set('Content-Type', 'application/json')
        });
      }

      request = request.clone({
        headers: request.headers.set('Accept', 'application/json')
      });
    }

    return next.handle(request).pipe(catchError(this.handleError.bind(this)));
  }

  private handleError(err: HttpErrorResponse): Observable<any> {
    if (err.status === 401 || err.status === 403) {
      if (
        err.url.substr(err.url.length - 4) === 'auth' &&
        err.headers.get('www-authenticate') === UserAuthType.TWO_FACTOR
      ) {
        return throwError(err);
      }
      // if it isn't 3rd party request and it is auth issue we should redirect on login and do cleaning stuff
      if (!['https://api.ipdata.co'].includes(origin)) {
        console.log('Unauthorized', err.status);
        const name = localStorage.getItem('name');
        localStorage.clear();
        localStorage.setItem('name', name);
        this.router.navigate(['/login']);
      }
      return throwError(err.message);
    }
    console.log(err);
    // handle your auth error or rethrow
    return throwError(err);
  }
}
