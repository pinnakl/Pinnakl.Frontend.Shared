import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserTypes } from '@pnkl-frontend/authentication';
import {
  AuthenticationService,
  ILoginAuthError,
  PinnaklSpinner,
  SessionInformation,
  Toastr,
  TwoFactorType,
  User,
  UserService
} from '@pnkl-frontend/core';
import { Destroyable } from '@pnkl-frontend/shared';

import { reject } from 'lodash';
import { EMPTY, Observable } from "rxjs";
import { catchError, finalize, map, takeUntil, tap } from 'rxjs/operators';

import {
  DEFAULTSCREEN as DEFAULTSCREEN_TOKEN,
  PRODUCTION as PRODUCTION_TOKEN,
  USERTYPE as USER_TYPE
} from '../environment.tokens';
import { createQrCodeDecryptedValue } from "./sso-helpers";

declare const require: any;
const packageJson = require('../../../../../package.json');

interface AuthenticationError {
  message: string;
  activeSessions?: SessionInformation[];
}

@Component({
  selector: 'login',
  templateUrl: 'login.component.html'
})
export class LoginComponent extends Destroyable implements OnInit {
  activeSessions: SessionInformation[] = [];
  sessionManagerVisible = false;
  version: string;
  token = '';
  form: FormGroup;
  forgotPasswordForm: FormGroup;
  submitted = false;
  showOtpInput = false;
  userName: string;

  otpInputDigitsLeft = 6;
  otpInputCompleted: boolean;
  otpChannel: TwoFactorType;
  hideQrModalDialog = true;

  isForgotPasswordEnabled = false;

  private readonly ROUTE_AFTER_LOGIN: string;

  qrCodeSecret$: Observable<string>;

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly spinner: PinnaklSpinner,
    private readonly toastr: Toastr,
    private readonly userService: UserService,
    @Inject(DEFAULTSCREEN_TOKEN) private readonly DEFAULTSCREEN: { prod: string, dev: string },
    @Inject(PRODUCTION_TOKEN) private readonly PRODUCTION: boolean,
    @Inject(USER_TYPE) readonly USERTYPE: string
  ) {
    super();
    this.version = packageJson.version;

    console.log('Login page: PROD:', this.PRODUCTION);
    console.log('Login page: DEFAULTSCREEN:', this.DEFAULTSCREEN);

    this.ROUTE_AFTER_LOGIN = this.PRODUCTION
      ? DEFAULTSCREEN.prod
      : DEFAULTSCREEN.dev;
  }

  deactivateAllSessions(): void {
    this.spinner.spin();
    Promise.all(
      this.activeSessions.map(as =>
        this.authenticationService.deAuthenticate(as.userToken)
      )
    )
      .then(() => {
        this.activeSessions = [];
        this.sessionManagerVisible = false;
        this.onSubmit(this.form);
      })
      .catch(() => {
        this.toastr.error('Failed to deactivate this session');
      })
      .then(() => {
        this.spinner.stop();
      });
  }

  deactivateSession(session: SessionInformation): void {
    this.spinner.spin();
    this.authenticationService
      .deAuthenticate(session.userToken)
      .then(() => {
        this.activeSessions = reject(this.activeSessions, { id: session.id });
        if (!this.activeSessions.length) {
          this.sessionManagerVisible = false;
          this.onSubmit(this.form);
        }
      })
      .catch(() => {
        this.toastr.error('Failed to deactivate this session');
      })
      .then(() => {
        this.spinner.stop();
      });
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      otp: null,
      username: [null, Validators.required],
      password: [null, Validators.required],
      remember: []
    });
    this.forgotPasswordForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.pattern('^([a-zA-Z0-9_\\-\\.\\+]+)@([a-zA-Z0-9_\\-\\.]+)')]]
    });
    // if (!this.PRODUCTION) {
    //   this.form.patchValue({
    //     username: 'tarun',
    //     password: 'password'
    //   });
    // }
    this.setUserName();
  }

  onSessionManagerClose(): void {
    this.sessionManagerVisible = false;
  }

  altLogin(): void {
    this.toastr.info('Login with Office 365 is not available yet.');
    // Worked MS SSO flow. Some issues should be fixed on BE side.
    // this.authService.loginPopup()
    //   .pipe(switchMap((res) => {
    //     return this.authService.acquireTokenSilent({
    //       authority: this.msalInterceptorConfig.authRequest as string,
    //       account: this.authService.instance.getAccountByUsername(res.account.username),
    //       scopes: auth.resources.todoListApi.resourceScopes
    //     });
    //   })).subscribe((response: AuthenticationResult) => {
    //   this.authService.instance.setActiveAccount(response.account);
    //   const user = {
    //     fullName: response.account.name,
    //     firstName: response.account.name.split(' ')[0],
    //     lastName: response.account.name.split(' ')[1],
    //     email: response.account.username,
    //     token: `Bearer ${ response.accessToken }`
    //   };
    //
    //   this.userService.setUser(user as User);
    //   this.userService.getFullUserDataByEmail(this.userService.getUser().email)
    //     .then((userFromApi: User) => {
    //       userFromApi.token = user.token;
    //       this.userService.setUser(userFromApi);
    //       this.router.navigate([ this.ROUTE_AFTER_LOGIN ]).then(() => {
    //       });
    //     });
    // }, (error) => {
    //   this.toastr.error(error);
    //   console.error(error);
    // });
  }

  forgotPassword(form: FormGroup): void {
    this.submitted = true;
    if (!form.valid) {
      return;
    }

    this.spinner.spin();
    const { email } = form.value;
    this.authenticationService.forgotPassword(email)
      .pipe(takeUntil(this.unsubscribe$), finalize(() => this.spinner.stop()))
      .subscribe(() => {
        this.toastr.success(`Temporary password sent to ${email}`);
        this.forgotPasswordToggle();
      }, (error: HttpErrorResponse) => {
        this.toastr.error('Error while forgotPassword');
        console.error('Error while forgotPassword', error);
      });
  }

  async onSubmit(form: FormGroup): Promise<void> {
    this.submitted = true;
    if (!form.valid) {
      return;
    }

    const { otp, username, password } = form.value as { otp: string, username: string, password: string };

    /** EXTERNAL used for `CRM INVESTOR APP` - 1FA and 2FA auth types allowed.
     * INTERNAL used for WEB APP & CRM - 2FA auth only allowed
    */

    if (this.USERTYPE === UserTypes.EXTERNAL) {
      this.externalAuthHandler({ username, password });
    }

    if (this.USERTYPE === UserTypes.INTERNAL) {
      this.internalAuthHandler({ otp, username, password });
    }

  }

  //#region Auth methods
  private async externalAuthHandler({ username, password }: { username: string, password: string }): Promise<void> {
    await this.authenticationService.authenticate(username, password, this.USERTYPE)
      .then((user: User) => this.checkResetPasswordFromLogin(user.passwordResetRequired))
      // request fails and the next page view should be OTP input with QR code link.
      .catch(async (error) => {
        if (error.status === 400) {
          this.toastr.error(error.message);
          this.submitted = false;
        } else {
          this.otpChannel = ({ ...error } as ILoginAuthError).otpChannel;
          this.showOtpInput = true;
        }
      });
  }

  private internalAuthHandler({ otp, username, password }: { otp: string, username: string, password: string }) {
    this.showOtpInput
      ? this.callTwoFactorWayAuthMethod({ otp, username, password })
      : this.callOneFactorWayAuthMethod({ username, password });
  }

  private async callTwoFactorWayAuthMethod({ otp, username, password }: { otp: string, username: string, password: string }) {
    this.spinner.spin();
    try {
      await this.authenticationService.loginTwoFA(username, password, otp, this.token, this.USERTYPE)
        .then((user: User) => this.checkResetPasswordFromLogin(user.passwordResetRequired));
      await this.router.navigate([this.ROUTE_AFTER_LOGIN]);
      this.spinner.stop();
    } catch (_) {
      this.spinner.stop();
      this.toastr.error('Unable to authenticate using OTP entered below');
    }
  }

  private async callOneFactorWayAuthMethod({ username, password }: { username: string, password: string }) {
    this.spinner.spin();
    try {
      await this.authenticationService.authenticate(username, password, this.USERTYPE)
        .then((user: User) => this.checkResetPasswordFromLogin(user.passwordResetRequired));
      await this.router.navigate([this.ROUTE_AFTER_LOGIN]);
    } catch (error) {
      const authError = { ...error } as ILoginAuthError;
      this.otpChannel = authError.otpChannel;
      this.submitted = false;
      // If 2FA enabled
      if (authError.is2FA) {
        this.showOtpInput = true;
        if (authError.otpChannel === TwoFactorType.EMAIL || authError.otpChannel === TwoFactorType.MOBILE) {
          this.getAuthEmailMobileToken({ username, password });
        }
      } else {
        this.toastr.error('Incorrect email or password combination');
        const { activeSessions } = error as AuthenticationError;
        if (activeSessions && activeSessions.length) {
          this._handleActiveSessions(activeSessions);
        }
      }
    }
    this.spinner.stop();
  }

  private async getAuthEmailMobileToken({ username, password }): Promise<void> {
    await this.authenticationService.authenticateTwoFA(username, password)
      .then(token => this.token = token)
      .catch(_ => this.toastr.error('Authentication failed'))
  }

  //#endregion

  codeChanged(event: number): void {
    this.form.get('otp').setValue(event.toString());
    this.otpInputDigitsLeft = 6 - event.toString().length;
    this.otpInputCompleted = false;
  }

  codeCompleted(event: number): void {
    this.otpInputCompleted = true;
  }

  loginOtp(): void {
    this.USERTYPE === UserTypes.EXTERNAL
      ? this.callTwoFactorWayAuthMethod({ ...this.form.value })
      : this.onSubmit(this.form);
  }

  forgotPasswordToggle(): void {
    this.isForgotPasswordEnabled = !this.isForgotPasswordEnabled;
  }

  openModalToGetQrCode(): void {
    const { username, password } = this.form.value;
    this.qrCodeSecret$ = this.authenticationService.getQrSercet(username, password, this.USERTYPE).pipe(
      map(secret => createQrCodeDecryptedValue(username, secret)),
      tap(() => this.hideQrModalDialog = false),
      catchError(() => {
        this.toastr.error(`Can't get a QR Code`);
        return EMPTY;
      })
    );
  }

  closeQrModal(): void {
    this.hideQrModalDialog = true;
  }

  async resendCode(): Promise<void> {
    const { username, password } = this.form.value;
    this.token = await this.authenticationService.authenticateTwoFA(username, password);
    this.toastr.success('The code was sent successfully');
  }

  private _handleActiveSessions(activeSessions: SessionInformation[]): void {
    this.activeSessions = activeSessions;
    this.sessionManagerVisible = true;
  }

  private setUserName(): void {
    const nameFromStorage = localStorage.getItem('name');
    this.userName = nameFromStorage && nameFromStorage !== 'null' && nameFromStorage !== 'undefined' ? nameFromStorage : null;
  }

  private checkResetPasswordFromLogin(passwordResetRequired: boolean): void {
    if (passwordResetRequired) {
      this.userService.isResetPassword$.next({ isLoginPass: true, isPageReady: false });
    }
  }

}
