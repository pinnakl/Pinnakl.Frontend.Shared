import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { PinnaklSpinner, User } from '@pnkl-frontend/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../environments';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  constructor(private router: Router, private spinner: PinnaklSpinner) {}
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const userInSession: User = JSON.parse(localStorage.getItem('user'));
    const token: string = userInSession && userInSession['token'];

    // console.log('Prod value: ', this.PRODUCTION);
    // console.log('URL: ', request.url);

    const url = !request.url.includes('http')
      ? environment.httpServiceUrl.concat(request.url)
      : request.url;
    request = request.clone({
      url: url
    });
    const { origin } = new URL(url);
    const is3rdPartyReuest = ['https://api.ipdata.co'].includes(origin);
    // Omit modification of 3rd-party requests to prevent CORS errors
    if (!is3rdPartyReuest) {
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

    return next
      .handle(request)
      .pipe(catchError((err: HttpErrorResponse) => this.handleError(err)));
  }

  private handleError(err: HttpErrorResponse): Observable<any> {
    if (err.status === 401 || err.status === 403) {
      console.log('Unauthorized', err.status);
      localStorage.clear();
      this.router.navigate(['/login']);
      return of(err.message);
    }
    console.log(err);
    // handle your auth error or rethrow
    return throwError(err);
  }
}
