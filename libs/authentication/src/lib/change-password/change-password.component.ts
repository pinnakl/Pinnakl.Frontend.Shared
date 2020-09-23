import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { User } from '@pnkl-frontend/core';
import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { UserService } from '@pnkl-frontend/core';

@Component({
  selector: 'change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
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
    private activatedRoute: ActivatedRoute,
    private spinner: PinnaklSpinner,
    private toastr: Toastr,
    private router: Router,
    private userService: UserService
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
    if (!(this.pwd && this.confirmPwd && this.pwd === this.confirmPwd)) {
      this.passwordNoMatch = true;
    } else {
      this.passwordNoMatch = false;
    }
  }

  changePassword(): void {
    if (this.disableSubmitBtn === false && this.passwordNoMatch === false) {
      this.spinner.spin();
      this.userService
        .putUser({
          id: this.user.id,
          password: this.pwd
        })
        .then(() => {
          this.emptyForm();
          this.spinner.stop();
          this.toastr.success('Password changed successfully!');
          this.router.navigate(['/dashboard']);
        });
    }
  }

  emptyForm() {
    this.pwd = '';
    this.confirmPwd = '';
  }
}
