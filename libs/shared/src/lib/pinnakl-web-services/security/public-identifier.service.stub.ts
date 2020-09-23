import { PublicIdentifier } from '../../models/security/public-identifier.model';

export class PublicIdentifierServiceStub {
  postIdentifier(entityToSave: PublicIdentifier): Promise<PublicIdentifier> {
    return Promise.resolve(entityToSave);
  }
}
