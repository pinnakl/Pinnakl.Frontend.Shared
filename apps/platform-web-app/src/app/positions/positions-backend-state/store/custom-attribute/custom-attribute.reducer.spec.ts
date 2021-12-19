import { CustomAttribute } from '@pnkl-frontend/shared';
import {
  AttemptLoadCustomAttributes,
  LoadCustomAttributes,
  LoadCustomAttributesFailed
} from './custom-attribute.actions';
import { initialState, reducer } from './custom-attribute.reducer';

const customAttribute: CustomAttribute = new CustomAttribute(
  1,
  'Internal Rating',
  'List'
);

describe('CustomAttribute Reducer', () => {
  describe('AttemptLoadCustomAttributes', () => {
    it('should set the loading to true and loaded to false', () => {
      const action = new AttemptLoadCustomAttributes();

      const result = reducer(initialState, action);

      expect(result).toEqual({
        ...initialState,
        loaded: false,
        loading: true
      });
    });
  });
  describe('LoadCustomAttributes', () => {
    it('should populate customAttributes and set the loading to false and loaded to true', () => {
      const action: LoadCustomAttributes = new LoadCustomAttributes({
        customAttributes: [customAttribute]
      });

      const result = reducer(initialState, action);

      expect(result).toEqual({
        entities: { [customAttribute.id]: customAttribute },
        loaded: true,
        loading: false,
        ids: [customAttribute.id]
      });
    });
  });
  describe('LoadCustomAttributesFailed', () => {
    it('should set the loading to false and loaded to false', () => {
      const action = new LoadCustomAttributesFailed({
        error: 'test error'
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
