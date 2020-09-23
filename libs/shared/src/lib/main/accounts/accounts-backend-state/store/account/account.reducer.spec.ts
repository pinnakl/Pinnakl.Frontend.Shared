import { initialState, reducer } from './account.reducer';

import { Account } from '../../../../../models';
import { LoadAccounts } from './account.actions';

describe('Account Reducer', () => {
  const accounts = getAccounts();
  describe('LoadAccounts', () => {
    it('should add the account entities and ids to the state and set loaded to true', () => {
      const action = new LoadAccounts({ accounts });
      const result = reducer(initialState, action);
      expect(result).toEqual({
        ...initialState,
        entities: accounts.reduce(
          (entities, account) => ({
            ...entities,
            [account.id]: account
          }),
          {}
        ),
        ids: accounts.map(a => a.id),
        loaded: true
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
