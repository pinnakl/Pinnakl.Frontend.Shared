import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ServerSentEventsStreamService, UserService } from '@pnkl-frontend/core';
import { environment } from '../../../../../environments';
import { createPriceStreamMock } from './price-stream.mock';
import { PriceStreamModel } from './price-stream.model';

const USE_MOCK = !environment.production && false;

@Injectable({
  providedIn: 'root'
})
export class PriceStreamService {
  constructor(
    private readonly _sse: ServerSentEventsStreamService,
    private readonly _userService: UserService
  ) {}

  subscribe(): Observable<PriceStreamModel> {
    return USE_MOCK
      ? createPriceStreamMock()
      : this._sse.subscribeToServerSentEvents<any>(environment.sseBackupAppUrl, [], 'RTPrice')
          .pipe(
            map(
              (prices): PriceStreamModel => ({
                securityId: prices.Message.SecurityId,
                priceType: prices.Message.PriceType,
                value: getNumber(prices.Message.Value)
              })
            )
          );
  }

  unsubscribe(): void {
    this._sse.unsubscribeToServerSentEvents(environment.sseBackupAppUrl, [], 'RTPrice');
  }
}

function getNumber(value: string | number): number {
  const numericValue = +value;
  return isNaN(numericValue) ? null : numericValue;
}
