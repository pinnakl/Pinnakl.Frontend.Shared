import { AdminAccount } from '@pnkl-frontend/shared';
import { ClientConnectivity } from '@pnkl-frontend/shared';
import { GenericEntityWithName } from '@pnkl-frontend/shared';
import { CurrencyForOMS } from '@pnkl-frontend/shared';
import { AdminIdentifier } from '@pnkl-frontend/shared';
import { CustomAttributeValue } from '@pnkl-frontend/shared';
import { CustomAttribute } from '@pnkl-frontend/shared';
import { Market } from '@pnkl-frontend/shared';
import { Organization } from '@pnkl-frontend/shared';
import { PbIdentifier } from '@pnkl-frontend/shared';
import { PublicIdentifier } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import { SecurityMarket } from '@pnkl-frontend/shared';
import { SecurityType } from '@pnkl-frontend/shared';
import { Security } from '@pnkl-frontend/shared';

export class SecurityDetailsResolvedData {
  adminAccounts: AdminAccount[];
  adminIdentifiers: AdminIdentifier[];
  clientConnectivities: ClientConnectivity[];
  customAttributes: CustomAttribute[];
  customAttributeValues: CustomAttributeValue[];
  markets: Market[];
  publicIdentifierTypes: GenericEntityWithName[];
  pbIdentifiers: PbIdentifier[];
  publicIdentifiers: PublicIdentifier[];
  securities: Security[];
  security: Security;
  securityMarkets: SecurityMarket[];
  constructor(
    public currencies: CurrencyForOMS[],
    public manualSecuritySource: number,
    public organizations: Organization[],
    public sectorOptions: SecurityAttributeOption[],
    public securityTypes: SecurityType[],
    editSecurityData?: EditSecurityData
  ) {
    if (editSecurityData) {
      Object.assign(this, editSecurityData);
    }
  }
}

export class EditSecurityData {
  constructor(
    public adminAccounts: AdminAccount[],
    public adminIdentifiers: AdminIdentifier[],
    public clientConnectivities: ClientConnectivity[],
    public customAttributes: CustomAttribute[],
    public customAttributeValues: CustomAttributeValue[],
    public markets: Market[],
    public pbIdentifiers: PbIdentifier[],
    public publicIdentifiers: PublicIdentifier[],
    public publicIdentifierTypes: GenericEntityWithName[],
    public securities: Security[],
    public security: Security,
    public securityMarkets: SecurityMarket[]
  ) {}
}
