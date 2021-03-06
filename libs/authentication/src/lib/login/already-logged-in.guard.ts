import { Injectable, Inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { UserService } from '@pnkl-frontend/core';
import { DEFAULTSCREEN } from '../environment.tokens';

@Injectable()
export class AlreadyLoggedInGuard implements CanActivate {
  constructor(
    private readonly router: Router,
    private readonly _userService: UserService,
    @Inject(DEFAULTSCREEN) private readonly DEFAULTSCREEN: { prod: string, dev: string },
  ) { }

  canActivate(): boolean {
    const _userLoggedIn = this._userLoggedIn();
    if (_userLoggedIn) {
      this.router.navigate(['/' + this.DEFAULTSCREEN.prod]);
      return false;
    }
    return true;
  }

  private _userLoggedIn(): boolean {
    const user = this._userService.getUser();
    return !!user;
  }
}
