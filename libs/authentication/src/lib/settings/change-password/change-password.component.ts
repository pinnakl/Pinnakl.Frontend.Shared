import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { User } from '@pnkl-frontend/core';
import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { UserService } from '@pnkl-frontend/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  @Input() isResetPassword = false;
  @Output() isResetPasswordDone = new EventEmitter<boolean>();
  user: User;
  disableSubmitBtn = true;
  passwordNoMatch = false;
  pwd: string;
  confirmPwd: string;
  passwordStrength: string;
  private readonly strongRegex = new RegExp(
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'
  );

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly spinner: PinnaklSpinner,
    private readonly toastr: Toastr,
    private readonly userService: UserService
  ) {
    this.user = this.activatedRoute.snapshot.data.resolveData;
  }

  analyzePassword(pwd: string): void {
    if (this.confirmPwd) {
      this.matchPassword();
    }
    if (this.strongRegex.test(pwd)) {
      this.passwordStrength = 'strong';
      this.disableSubmitBtn = false;
    } else {
      this.passwordStrength = 'weak';
      this.disableSubmitBtn = true;
    }
  }

  matchPassword(): void {
    if (this.passwordStrength === 'strong') {
      this.passwordStrength = '';
    }
    this.passwordNoMatch = !(this.pwd && this.confirmPwd && this.pwd === this.confirmPwd);
  }

  changePassword(): void {
    if (this.disableSubmitBtn === false && this.passwordNoMatch === false) {
      this.spinner.spin();

      if (!this.user?.id) {
        this.user = this.userService.getUser();
      }

      const userToUpdate = {
        id: this.user.id.toString(),
        password: this.pwd
      } as {id: string, password: string, passwordresetrequired?: string};

      if (this.isResetPassword) {
        userToUpdate.passwordresetrequired = '0';
      }
      this.userService
        .putUser(userToUpdate)
        .then(() => {
          this.emptyForm();
          this.spinner.stop();
          this.isResetPasswordDone.emit(true);
          this.toastr.success('Password changed successfully!');
        });
    }
  }

  emptyForm(): void {
    this.pwd = '';
    this.confirmPwd = '';
  }
}
