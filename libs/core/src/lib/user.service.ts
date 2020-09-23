import { Injectable } from '@angular/core';

import { User } from './models/user.model';
import { WebServiceProvider } from './web-service-provider.service';

@Injectable()
export class UserService {
  constructor(private wsp: WebServiceProvider) {}

  getUser(): User | null {
    const userInSession = localStorage.getItem('user');
    return userInSession ? JSON.parse(userInSession) : null;
  }
  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  putUser(putJson: any): Promise<User> {
    return this.wsp.put({ endPoint: 'users', payload: putJson });
  }
}
