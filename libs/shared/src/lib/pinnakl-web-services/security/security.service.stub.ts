import { Security } from '../../models/security/security.model';

export class SecurityServiceStub {
  postSecurity(entityToSave: Security): Promise<Security> {
    return Promise.resolve(entityToSave);
  }
  putSecurity(entityToSave: Security): Promise<Security> {
    return Promise.resolve(entityToSave);
  }
}
