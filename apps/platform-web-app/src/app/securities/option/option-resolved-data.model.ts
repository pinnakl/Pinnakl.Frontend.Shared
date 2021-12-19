import { Option } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';

export class OptionResolvedData {
  constructor(
    public option: Option,
    public optionTypeOptions: SecurityAttributeOption[],
    public putCallIndicatorOptions: SecurityAttributeOption[]
  ) {}
}
