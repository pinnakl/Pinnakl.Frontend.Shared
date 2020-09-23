import { TestBed } from '@angular/core/testing';

import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';

import { Account } from '../../../../../models';
import { AccountService } from '../../../../../pinnakl-web-services/account.service';
import {
  AttemptLoadAccounts,
  LoadAccounts,
  LoadAccountsFailed
} from './account.actions';
import { AccountEffects } from './account.effects';

describe('AccountEffects', () => {
  let actions$: Observable<any>;
  let effects: AccountEffects;
  let service: AccountService;

  const accounts = getAccounts();
  const accountService = {
    getAccounts: () => {}
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AccountEffects,
        provideMockActions(() => actions$),
        {
          provide: AccountService,
          useValue: accountService
        }
      ]
    });
    effects = TestBed.get(AccountEffects);
    service = TestBed.get(AccountService);
  });

  describe('load$', () => {
    beforeEach(() => {
      actions$ = of(new AttemptLoadAccounts());
    });
    it('should dispatch a Load action if Load succeeds', done => {
      spyOn(service, 'getAccounts').and.returnValue(Promise.resolve(accounts));
      const completion = new LoadAccounts({ accounts });
      effects.load$.subscribe(result => {
        expect(result).toEqual(completion);
        done();
      });
    });
    it('should dispatch a LoadFaild action if Load fails', done => {
      const error = 'server busy';
      spyOn(service, 'getAccounts').and.returnValue(Promise.reject(error));
      const completion = new LoadAccountsFailed({ error });
      effects.load$.subscribe(result => {
        expect(result).toEqual(completion);
        done();
      });
    });
  });
});

function getAccounts(): Account[] {
  return [
    {
      accountCode: 'CMST',
      accountNum: 'CMST',
      id: '1',
      isPrimaryForReturns: true,
      name: 'Corrib Master Fund, Ltd',
      orderOfImportance: '1'
    },
    {
      accountCode: 'PCH',
      accountNum: 'PCH',
      id: '2',
      isPrimaryForReturns: false,
      name: 'PAAMCO Managed Account',
      orderOfImportance: '2'
    }
  ];
}
