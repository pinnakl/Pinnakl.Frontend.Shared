import { TestBed } from '@angular/core/testing';

import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';

import { AccountingService } from '../../../../pinnakl-web-services/accounting.service';
import { AttemptLoadAum, LoadAum, LoadAumFailed } from './aum.actions';
import { AumEffects } from './aum.effects';

describe('AumEffects', () => {
  let actions$: Observable<any>;
  let effects: AumEffects;
  let service: AccountingService;

  const mockAccountingService = {
    getAUMByAccountIdAndDate: () => {}
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AumEffects,
        provideMockActions(() => actions$),
        {
          provide: AccountingService,
          useValue: mockAccountingService
        }
      ]
    });
    effects = TestBed.get(AumEffects);
    service = TestBed.get(AccountingService);
  });

  describe('load$', () => {
    beforeEach(() => {
      actions$ = of(new AttemptLoadAum({ accountId: 1, date: new Date() }));
    });
    it('should dispatch a Load action if Load succeeds', async () => {
      const aum = 9.999;
      spyOn(service, 'getAUMByAccountIdAndDate').and.returnValue(
        Promise.resolve([{ aum: aum.toString() }])
      );
      const completion = new LoadAum({ aum });
      const result = await effects.load$.pipe(take(1)).toPromise();
      expect(result).toEqual(completion);
    });
    it('should dispatch a LoadFaild action if Load fails', async () => {
      const error = 'server busy';
      spyOn(service, 'getAUMByAccountIdAndDate').and.returnValue(
        Promise.reject(error)
      );
      const completion = new LoadAumFailed({ error });
      const result = await effects.load$.pipe(take(1)).toPromise();
      expect(result).toEqual(completion);
    });
  });
});
