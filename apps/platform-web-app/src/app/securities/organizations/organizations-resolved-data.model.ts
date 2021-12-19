import { Country } from '@pnkl-frontend/shared';
import { Organization } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';

export class OrganizationsResolvedData {
  constructor(
    public countries: Country[],
    public organizations: Organization[],
    public organizationStatusTypes: SecurityAttributeOption[]
  ) {}
}
