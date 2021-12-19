export class User {
  public authType: string | null;
  public tradingAccess: boolean;
  public clientAdmin: string | boolean;
  public tokenReAuthInterval: string | null;
  public timezone: string | null;
  public applicationAccessLevel: ApplicationAccessLevel | null;
  public isDevUser: boolean;
  public passwordResetRequired: boolean;
  constructor(
    public clientId: number,
    public features: string[],
    public firstName: string,
    public fullName: string,
    public id: number,
    public lastName: string,
    public token: string,
    public username: string,
    public email: string,
    public phone: string,
    public otpChannel: string,
    public pinnaklClientName: string
  ) {
      this.clientAdmin = this.clientAdmin === 'True';
  }
}

export const userTimeZones = [
  {timeZone: '(UTC -5) New York'},
  {timeZone: '(UTC -6) Chicago'},
  {timeZone: '(UTC -7) Salt Lake City'},
  {timeZone: '(UTC -8) Los Angeles'},
  {timeZone: '(UTC -9) Anchorage'},
  {timeZone: '(UTC -10) Honolulu'},
  {timeZone: '(UTC +1) Central European Time'}
];

export enum UserAuthType {
  SINGLE_FACTOR = 'SINGLE_FACTOR',
  TWO_FACTOR = 'TWO_FACTOR',
  SSO = 'SSO'
}

export enum TwoFactorType {
  EMAIL = 'EMAIL',
  MOBILE = 'MOBILE',
  QR = 'QR'
}

export const userAuthTypes = {
  singleFactor: {
    value: UserAuthType.SINGLE_FACTOR,
    label: 'Single-factor authentification'
  },
  multiFactor: {
    value: UserAuthType.TWO_FACTOR,
    label: 'Two-factor authentification'
  },
  sso: {
    value: UserAuthType.SSO,
    label: 'Office 365 Single Sign On'
  },
};

export const multiFactorTypes = {
  email: {
    value: TwoFactorType.EMAIL,
    label: 'Email'
  },
  mobile: {
    value: TwoFactorType.MOBILE,
    label: 'Mobile'
  },
  qr: {
    value: TwoFactorType.QR,
    label: 'QR code'
  }
};

export const requestAuthenticationHours = [4, 8, 24];

export enum ApplicationAccessLevel {
  FULL_ACCESS = 'FULL_ACCESS',
  VIEW_ONLY = 'VIEW_ONLY',
  INACTIVE = 'INACTIVE'
}

export enum OtpSecretStatus {
	TRUE = 'True',
	FALSE = 'False'
}

export interface ILoginAuthError {
	hasOTPSecret: OtpSecretStatus,
	is2FA: boolean,
	otpChannel: TwoFactorType
}
