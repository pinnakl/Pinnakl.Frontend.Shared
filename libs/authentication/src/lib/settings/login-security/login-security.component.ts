import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import {
  multiFactorTypes,
  PinnaklSpinner,
  requestAuthenticationHours,
  Toastr,
  TwoFactorType,
  User,
  UserAuthType,
  userAuthTypes,
  UserService
} from '@pnkl-frontend/core';

const securityFormValidator: ValidatorFn = (fg: FormGroup) => {
  const authType = fg.get('authType').value;
  const otpChannel = fg.get('otpChannel').value;
  return (authType === UserAuthType.TWO_FACTOR && Object.values(TwoFactorType).includes(otpChannel))
  || (authType !== UserAuthType.TWO_FACTOR) ? null : { isTwoFactorValid: false };
};

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'login-security',
  templateUrl: './login-security.component.html',
  styleUrls: [ './login-security.component.scss' ]
})
export class LoginSecurityComponent implements OnChanges {
  @Input('users') set setUsers (value: User[]) {
    this.users = value || [];
    this.forMultipleUsers = this.users?.length > 1;
    this.usersWithMissedEmail = this.getUsersWithMissedEmail(this.users);
    this.usersWithMissedPhone = this.getUsersWithMissedPhone(this.users);

    this.resetForm();
  }
  @Output() updateUsers = new EventEmitter<User[]>();
  @Output() cancelModal = new EventEmitter<void>();

  users: User[] = [];
  forMultipleUsers: boolean;
  usersWithMissedPhone: User[] = [];
  usersWithMissedEmail: User[] = [];
  usersFullNamesWithMissedPhone = '';
  usersFullNamesWithMissedEmail = '';



  private readonly userAuthType = UserAuthType;
  readonly userAuthTypes = userAuthTypes;
  readonly requestAuthenticationHours = requestAuthenticationHours;
  readonly multiFactorTypes = multiFactorTypes;

  cancelConfirmationVisible = false;
  loginSecurityForm: FormGroup;

  constructor(
    private readonly _userService: UserService,
    private readonly _spinner: PinnaklSpinner,
    private readonly _toastr: Toastr) {}

  get isMultiFactorSelected(): boolean {
    return this.loginSecurityForm?.get('authType').value === this.userAuthType.TWO_FACTOR;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.users) {
      this.resetForm();
    }
  }

  showFormCancelConfirmation(): void {
    this.cancelConfirmationVisible = true;
  }

  cancelReset(): void {
    this.cancelConfirmationVisible = false;
  }

  resetForm(): void {
    this.initLoginSecurityForm();
    this.cancelReset();
  }

  onCancelModal(): void {
    this.cancelModal.emit();
  }

  onSubmit(): void {
    if (this.forMultipleUsers) {
      this.users.forEach(u => {
        const userAuthToSave = {
          id: u?.id.toString(),
          authtype: this.loginSecurityForm.get('authType').value,
          tokenreauthinterval: this.loginSecurityForm.get('tokenReAuthInterval').value.toString()
        };
        this.saveUser(userAuthToSave);
      });
      this._toastr.success('Successfully changed');
    } else {
      const userAuthToSave = {
        id: this.users[0]?.id.toString(),
        authtype: this.loginSecurityForm.get('authType').value,
        tokenreauthinterval: this.loginSecurityForm.get('tokenReAuthInterval').value.toString()
      };
      this.saveUser(userAuthToSave);
    }

  }

  private initLoginSecurityForm(): void {
    if (this.forMultipleUsers) {
      this.loginSecurityForm = new FormGroup({
        authType: new FormControl(null, [Validators.required]),
        otpChannel: new FormControl(null),
        tokenReAuthInterval: new FormControl(null, [Validators.required])
      }, { validators: [securityFormValidator] });
    } else {
      this.loginSecurityForm = new FormGroup({
        authType: new FormControl(this.users[0] ? this.users[0]?.authType : null, [Validators.required]),
        otpChannel: new FormControl(this.users[0] ? this.getOtpChannelForUser(this.users[0]) : null),
        tokenReAuthInterval: new FormControl(this.users[0] ? +this.users[0]?.tokenReAuthInterval : null, [Validators.required])
      }, { validators: [securityFormValidator] });
    }
  }

  // if otpChannel is empty - return the default 2FA type.
  private getOtpChannelForUser(user: User) {
    return user.otpChannel ? user.otpChannel : TwoFactorType.EMAIL;
  }

  private getUsersWithMissedPhone(users: User[]): User[] {
    const result =  users.filter(u => !u.phone);
    this.usersFullNamesWithMissedPhone = result.map(x => x.fullName).join(', ');
    return result;
  }

  private getUsersWithMissedEmail(users: User[]): User[] {
    const result =  users.filter(u => !u.email);
    this.usersFullNamesWithMissedEmail = result.map(x => x.fullName).join(', ');
    return result;
  }

  private saveUser(userAuthToSave: any): void {
    const otpValue = this.loginSecurityForm.get('otpChannel').value;

    if (!this.forMultipleUsers && this.isMultiFactorSelected) {

      userAuthToSave['otpchannel'] = otpValue;

    } else if (this.forMultipleUsers) {

      let is2FAEnabled: boolean;
      if (otpValue === this.multiFactorTypes.email.value) {
        is2FAEnabled = !this.usersWithMissedEmail.find(u => u.id === userAuthToSave.id)?.id;
      } else if (otpValue === this.multiFactorTypes.mobile.value) {
        is2FAEnabled = !this.usersWithMissedPhone.find(u => u.id === userAuthToSave.id)?.id;
      } else if (otpValue === this.multiFactorTypes.qr.value) {
        is2FAEnabled = true;
      }
      if (is2FAEnabled) {
        userAuthToSave['otpchannel'] = otpValue;
      } else {
        return;
      }

    }

    this._spinner.spin();
    this._userService.putUser(userAuthToSave).then(user => {
      const updatedUser = this._userService.setUserFromApi(user);
      this.updateUsers.emit([updatedUser]);
      this._spinner.stop();
      if (!this.forMultipleUsers) {
        this._toastr.success('Successfully changed');
      }
    }).catch((e) => {
      console.error('Error user update', e);
      this._spinner.stop();
      this._toastr.error('Error in changing');
    });
  }
}
