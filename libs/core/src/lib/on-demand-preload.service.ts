import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { UserService } from './user.service';

export class OnDemandPreloadOptions {
  constructor(public routePath: string, public preload: boolean = true) {}
}

@Injectable()
export class OnDemandPreloadService {
  private readonly userModuleToPreload: {
    userId: number;
    modules: string[];
  }[] = [
    { userId: 41, modules: ['crm'] },
    { userId: 2, modules: ['oms', 'positions'] }
  ];
  private subject = new Subject<OnDemandPreloadOptions>();
  state = this.subject.asObservable();

  constructor(private userService: UserService) {}

  startPreload(routePath: string): void {
    const message = new OnDemandPreloadOptions(routePath, true);
    this.subject.next(message);
  }

  preloadAllModules(): void {
    let userId = this.userService.getUser().id;
    this.userModuleToPreload.forEach(user => {
      if (userId === user.userId) {
        user.modules.forEach(module => this.startPreload(module));
      }
    });
  }
}
