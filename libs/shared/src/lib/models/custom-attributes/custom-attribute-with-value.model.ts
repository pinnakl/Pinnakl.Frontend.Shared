import { CustomAttribute } from './custom-attribute.model';

export type CustomAttributeWithValue = CustomAttribute & {
  value: Date | number | string;
  valueId: number;
};
