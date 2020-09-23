import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';

@Injectable()
export class ConfirmActionService {
  private _resolve: (value: boolean) => void;
  private _showCalled = new Subject<string>();

  get showCalled(): Observable<string> {
    return this._showCalled.asObservable();
  }

  constructor() {}

  confirm(): void {
    this._resolve(true);
  }

  async show(message?: string): Promise<boolean> {
    this._showCalled.next(message);
    return new Promise<boolean>(resolve => (this._resolve = resolve));
  }

  reject(): void {
    this._resolve(false);
  }
}
