import { PositionsPnlDataField } from '../../positions-pnl-data-fields-backend';
import {
  AttemptLoadPositionsPnlDataFields,
  LoadPositionsPnlDataFields,
  LoadPositionsPnlDataFieldsFailed
} from './positions-pnl-data-fields.actions';
import { initialState, reducer } from './positions-pnl-data-fields.reducer';

const mockEntities: PositionsPnlDataField[] = [
  { id: 1, name: 'Sector', field: 'sector', type: 'security' }
];

describe('PositionsPnlDataFields Reducer', () => {
  describe('AttemptLoadPositionsPnlDataFields', () => {
    it('should set the loading properties appropriately', () => {
      const action = new AttemptLoadPositionsPnlDataFields();
      const result = reducer(initialState, action);
      expect(result).toEqual({
        ...initialState,
        loaded: false,
        loading: true
      });
    });
  });
  describe('LoadPositionsPnlDataFields', () => {
    it('should load the provided pnl fields', () => {
      const action = new LoadPositionsPnlDataFields({
        positionsPnlDataFields: mockEntities
      });
      const result = reducer(initialState, action);
      expect(result).toEqual({
        ...initialState,
        entities: mockEntities.reduce(
          (entities, pnlField) => ({ ...entities, [pnlField.id]: pnlField }),
          {}
        ),
        ids: mockEntities.map(x => x.id),
        loaded: true
      });
    });
  });
  describe('LoadPositionsPnlDataFieldsFailed', () => {
    it('should set the loading properties appropriately', () => {
      const action = new LoadPositionsPnlDataFieldsFailed({
        error: 'not found'
      });
      const result = reducer(initialState, action);
      expect(result).toEqual({
        ...initialState,
        loaded: false,
        loading: false
      });
    });
  });
});
