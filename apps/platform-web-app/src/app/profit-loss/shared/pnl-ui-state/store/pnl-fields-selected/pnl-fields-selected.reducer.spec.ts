import { RemoveField, SelectFields } from './pnl-fields-selected.actions';
import { initialState, reducer } from './pnl-fields-selected.reducer';

describe('PnlFieldsSelected Reducer', () => {
  describe('RemoveField', () => {
    it('should remove the provided field id', () => {
      const id = 101;
      const action = new RemoveField({ id });
      const result = reducer({ ...initialState, ids: [id] }, action);
      expect(result).toEqual({
        ...initialState,
        ids: []
      });
    });
  });
  describe('SelectFields', () => {
    it('should select the provided field ids', () => {
      const ids = [101, 102];
      const action = new SelectFields({ ids });
      const result = reducer(initialState, action);
      expect(result).toEqual({
        ...initialState,
        ids
      });
    });
  });
});
