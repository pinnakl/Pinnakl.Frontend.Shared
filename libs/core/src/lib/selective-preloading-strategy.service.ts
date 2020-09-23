import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';

import { EMPTY, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import {
  OnDemandPreloadOptions,
  OnDemandPreloadService
} from './on-demand-preload.service';

@Injectable()
export class OnDemandPreloadStrategy implements PreloadingStrategy {
  private preloadOnDemand$: Observable<OnDemandPreloadOptions>;
  private preloadedModules: string[] = [];

  constructor(private preloadOnDemandService: OnDemandPreloadService) {
    this.preloadOnDemand$ = this.preloadOnDemandService.state;
  }

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    return this.preloadOnDemand$.pipe(
      mergeMap(preloadOptions => {
        const shouldPreload = this.preloadCheck(route, preloadOptions);
        if (shouldPreload) {
          this.preloadedModules.push(route.path);
          return load();
        } else {
          return EMPTY;
        }
      })
    );
  }

  private preloadCheck(
    route: Route,
    preloadOptions: OnDemandPreloadOptions
  ): any {
    return (
      route.data &&
      route.data['preload'] &&
      [route.path, '*'].includes(preloadOptions.routePath) &&
      preloadOptions.preload &&
      !this.preloadedModules.includes(route.path)
    );
  }
}
