import { TestBed } from '@angular/core/testing';

import { Store } from '@ngrx/store';
import { StoreModule } from '@ngrx/store';
import { take } from 'rxjs/operators';

import { Account } from '../../../models';
import { AccountsBackendStateFacade } from './accounts-backend-state-facade.service';
import { reducers, State } from './store';
import { initialState, LoadAccounts } from './store/account';

describe('AccountsBackendStateFacade', () => {
  let facade: AccountsBackendStateFacade;
  let store: Store<State>;

  const mockAccounts: Account[] = [{ accountCode: 'CMST' } as Account];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccountsBackendStateFacade]
    });
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature('accountsBackend', reducers)
      ],
      providers: [AccountsBackendStateFacade]
    });
    facade = TestBed.inject(AccountsBackendStateFacade);
    store = TestBed.inject(Store);
  });

  describe('accounts$', () => {
    it('should select all accounts', async () => {
      const initialValue = await _getAccounts();
      expect(initialValue).toEqual(
        Object.keys(initialState.entities).map(id => initialState.entities[id])
      );
      _dispatchLoadAccounts(mockAccounts);
      const newValue = await _getAccounts();
      expect(newValue).toEqual(mockAccounts);
    });
  });

  describe('accountsLoaded$', () => {
    it('should select the accounts loaded value', async () => {
      const initialValue = await _getAccountsLoaded();
      expect(initialValue).toEqual(initialState.loaded);
      _dispatchLoadAccounts(mockAccounts);
      const newValue = await _getAccountsLoaded();
      expect(newValue).toEqual(true);
    });
  });

  function _dispatchLoadAccounts(accounts: Account[]): void {
    store.dispatch(LoadAccounts({ accounts }));
  }

  async function _getAccounts(): Promise<Account[]> {
    return facade.accounts$.pipe(take(1)).toPromise();
  }

  async function _getAccountsLoaded(): Promise<boolean> {
    return facade.accountsLoaded$.pipe(take(1)).toPromise();
  }
});
