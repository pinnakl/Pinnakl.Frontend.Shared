import { ApplicationAccessLevel } from './user.model';

export class UserFromApi {
  applicationaccesslevel: ApplicationAccessLevel;
  constructor(
    public clientid: string,
    public features: string,
    public firstname: string,
    public id: string,
    public lastname: string,
    public token: string,
    public username: string,
    public pinnaklClientName?: string
  ) {}
}

export interface UserFromApiModel {
  token: string;
  user: {
    id: string;
    clientId: string;
    lastName: string;
    userName: string;
    firstName: string;
    features: string[];
    passwordResetRequired?: boolean;
    pinnaklClientName?: string;
  };
}
