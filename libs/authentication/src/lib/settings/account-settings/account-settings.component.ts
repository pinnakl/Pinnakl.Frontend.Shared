import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PinnaklSpinner, Toastr, User, UserService, userTimeZones } from '@pnkl-frontend/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: [ './account-settings.component.scss' ]
})
export class AccountSettingsComponent implements OnChanges {
  readonly isEmailFormControlDisabled = true;
  readonly availableTimezones = userTimeZones;

  cancelConfirmationVisible = false;
  accountForm: FormGroup;

  @Input() user: User;
  @Output() updateUser = new EventEmitter<User>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly _userService: UserService,
    private readonly _spinner: PinnaklSpinner,
    private readonly _toastr: Toastr) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.user) {
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
    this.initAccountForm();
    this.cancelReset();
  }

  onSubmit(): void {
    const userAuthToSave = {
      id: this.user.id.toString(),
      firstname: this.accountForm.get('firstName').value,
      lastname: this.accountForm.get('lastName').value,
      username: this.accountForm.get('username').value,
      email: this.accountForm.get('email').value,
      phone: this.accountForm.get('phone').value,
      timezone: this.accountForm.get('timezone').value
    };

    this._spinner.spin();
    this._userService.putUser(userAuthToSave).then(user => {
      const updatedUser = this._userService.setUserFromApi(user);
      this.updateUser.emit(updatedUser);
      this.resetForm();
      this._spinner.stop();
      this._toastr.success('Successfully changed');
    }).catch(() => {
      this._spinner.stop();
      this._toastr.error('Error in changing');
    });
  }

  private initAccountForm(): void {
    this.accountForm = this.fb.group({
      firstName: [ this.user?.firstName, [ Validators.required ] ],
      lastName: [ this.user?.lastName, [ Validators.required ] ],
      username: [ this.user?.username, [ Validators.required ] ],
      email: [ this.user?.email, [ Validators.required, Validators.pattern('^([a-zA-Z0-9_\\-\\.\\+]+)@([a-zA-Z0-9_\\-\\.]+)') ] ],
      phone: [ this.user?.phone, [ Validators.required, Validators.pattern('^(([+][(]?[0-9]{1,5}[)]?)|([(]?[0-9]{3,5}[)]?))\s*[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?([-\s\.]?[0-9]{1,3})([-\s\.]?[0-9]{3,4})') ] ],
      timezone: [ this.user?.timezone ]
    });
  }
}
