import { CustomAttributeListOption } from './custom-attribute-list-option.model';

export class CustomAttribute {
  listOptions: CustomAttributeListOption[];
  constructor(public id: number, public name: string, public type: string) {}
}
