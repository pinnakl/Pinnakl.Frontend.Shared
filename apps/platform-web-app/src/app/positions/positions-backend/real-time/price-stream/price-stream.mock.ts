import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { PriceStreamModel } from './price-stream.model';

export function createPriceStreamMock(): Observable<PriceStreamModel> {
  return timer(0, 1000).pipe(
    map(() => {
      const random = Math.random();
      const securityIds = [1932]; // clientId 2
      // const securityIds = [2072, 2073, 2074, 2075, 2076, 2077]; // clientId 4
      const securityId = securityIds[Math.floor(random * securityIds.length)];
      const priceType = Math.round(random) ? 'delta' : 'mid';

      return {
        priceType,
        securityId,
        value: random
      };
    })
  );
}
