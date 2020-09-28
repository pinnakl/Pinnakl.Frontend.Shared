import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
declare const require: any;
const packageJson = require('../../../../../package.json');

import { reject } from 'lodash';

import {
  AuthenticationService,
  PinnaklSpinner,
  PushNotificationService,
  Toastr,
  UserService
} from '@pnkl-frontend/core';
import { PRODUCTION } from '../environment.tokens';
import { DEFAULTSCREEN } from '../environment.tokens';
import { SessionManagementService } from '../session-management';
import { SessionInformation } from '../session-management/session-information.model';

interface AuthenticationError {
  message: string;
  activeSessions?: SessionInformation[];
}

@Component({
  selector: 'login',
  templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit {
  activeSessions: SessionInformation[] = [];
  sessionManagerVisible = false;
  version: string;
  form: FormGroup;
  submitted = false;
  private readonly ROUTE_AFTER_LOGIN;

  constructor(
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private pushNotificationService: PushNotificationService,
    private router: Router,
    private sessionManagementService: SessionManagementService,
    private spinner: PinnaklSpinner,
    private toastr: Toastr,
    private userService: UserService,
    @Inject(DEFAULTSCREEN) private DEFAULTSCREEN: string,
    @Inject(PRODUCTION) private PRODUCTION: string
  ) {
    this.version = packageJson.version;

    console.log('Login page: PROD:', this.PRODUCTION);
    console.log('Login page: DEFAULTSCREEN:', this.DEFAULTSCREEN);

    this.ROUTE_AFTER_LOGIN = this.PRODUCTION
      ? DEFAULTSCREEN
      : 'reporting/all-reports';
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
      username: [, Validators.required],
      password: [, Validators.required],
      remember: []
    });

    // if (!this.PRODUCTION) {
    //   this.form.patchValue({
    //     username: 'tarun',
    //     password: 'password'
    //   });
    // }
  }

  onSessionManagerClose(): void {
    this.sessionManagerVisible = false;
  }

  async onSubmit(form: FormGroup): Promise<void> {
    this.submitted = true;
    if (!form.valid) {
      return;
    }
    const {
      username,
      password
    }: { username: string; password: string } = form.value;
    this.spinner.spin();
    try {
      const user = await this.authenticationService.authenticate(
        username,
        password
      );
      this.spinner.stop();
      this.userService.setUser(user);
      // try {
      //   await this.sessionManagementService.post();
      // } catch (e) {
      //   console.log(e.message);
      // }
      // try {
      //   await this.pushNotificationService.loadWebNotificationSettings();
      // } catch (e) {
      //   console.log(e.message);
      // }
      await this.router.navigate([this.ROUTE_AFTER_LOGIN]);
    } catch (error) {
      console.log(error);
      this.spinner.stop();
      this.toastr.error('Authentication failed');
      const { activeSessions } = error as AuthenticationError;
      if (activeSessions && activeSessions.length) {
        this._handleActiveSessions(activeSessions);
      }
    }
  }

  private _handleActiveSessions(activeSessions: SessionInformation[]): void {
    this.activeSessions = activeSessions;
    this.sessionManagerVisible = true;
  }
}
