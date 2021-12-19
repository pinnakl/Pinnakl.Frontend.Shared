export enum UserTypes {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL'
}

export interface AuthenticationAuthConfig {
	production: boolean;
	startupScreen: { prod: string, dev: string };
	userType: UserTypes;
}
