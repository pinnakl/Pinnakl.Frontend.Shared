import { initialState, reducer } from './backend-connection.reducer';

import { SetReconnectedAt } from './backend-connection.actions';

describe('BackendConnection Reducer', () => {
  describe('SetReconnectedAt', () => {
    it('should set the value of reconnectedAt', () => {
      const reconnectedAtValueToSet = new Date();
      const action = new SetReconnectedAt({
        reconnectedAt: reconnectedAtValueToSet
      });
      const result = reducer(initialState, action);
      expect(result).toEqual({
        ...initialState,
        reconnectedAt: reconnectedAtValueToSet
      });
    });
  });
});
