import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApplicationAccessLevel, PinnaklSpinner, Toastr, TwoFactorType, User, UserAuthType, UserService } from '@pnkl-frontend/core';
import { Destroyable } from '@pnkl-frontend/shared';
import { AccessControlService } from '@pnkl-frontend/shared';
import { find, isEmpty } from 'lodash';
import { filter } from 'lodash';
import { forkJoin, from, Subject } from 'rxjs';
import { finalize, map, takeUntil } from 'rxjs/operators';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'access-control',
  templateUrl: './access-control.component.html',
  styleUrls: [ './access-control.component.scss' ]
})
export class AccessControlComponent extends Destroyable implements OnInit {
  private currentUser: User;
  readonly applicationAccessLevel = ApplicationAccessLevel;
  users: User[];
  accessControlForm: FormGroup;
  cancelConfirmationVisible = false;

  selectedUsers: User[] = [];
  selectedUserIds = [];
  hideLoginSecurityModal = true;
  selectedUsersCount: number;

  constructor(
    private readonly fb: FormBuilder,
    private readonly _accessControlService: AccessControlService,
    private readonly _userService: UserService,
    private readonly _spinner: PinnaklSpinner,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _toastr: Toastr) {
    super();
    this.currentUser = this._activatedRoute.snapshot.data.resolveData;
  }

  get isAdminRole(): boolean {
    return !!this.currentUser?.clientAdmin;
  }

  ngOnInit(): void {
    this.getAccessControlUsers();

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

  onSubmit(): void {
    const changedUsersAccess = this.users.map((user: User) => {
      if (
        user.applicationAccessLevel !== this.accessControlForm.value[user.id.toString()].applicationAccessLevel
        || user.tradingAccess !== this.accessControlForm.value[user.id.toString()][`tradingAccess${ user.id }`]) {
        return {
          id: user.id.toString(),
          tradingaccess: this.accessControlForm.value[user.id.toString()][`tradingAccess${ user.id }`]?.toString(),
          applicationaccesslevel: this.accessControlForm.value[user.id.toString()].applicationAccessLevel
        };
      }
    }).filter(el => !isEmpty(el));
    this.updateUsersAccess(changedUsersAccess);
  }

  toggleLoginSecurityModal(): void {
    this.hideLoginSecurityModal = true;
  }

  onEditSingleUserLoginSecurity(event: any, user: User): void {
    event.stopPropagation();
    this.selectedUsers = [user];
    this.hideLoginSecurityModal = false;
  }

  onEditLoginSecurityForMultipleUsers(): void {
    this.selectedUsers = this.users.filter(user => !!this.selectedUserIds.find(id => id === user.id));
    this.hideLoginSecurityModal = false;
  }

  updateUsersLoginSecurity(users: User[]): void {
    this.users = this.users.map(u => users.find(x => x.id === u.id) || u);
    this.hideLoginSecurityModal = true;
  }

  private getAccessControlUsers(): void {
    this._spinner.spin();
    this._accessControlService.getAccessControlUsers()
      .pipe(
        takeUntil(this.unsubscribe$),
        finalize(() => {
          this._spinner.stop();
        }))
      .subscribe(
        (users: User[]) => {
          this.users = users;
          this.resetForm();
        },
        (error: HttpErrorResponse) => {
          console.error('Error in get users', error);
          this._toastr.error('Error in get users');
        });
  }

  private updateUsersAccess(collectionToSave: any): void {
    this._spinner.spin();
    forkJoin(collectionToSave.map(el => from(this._userService.putUser(el))) as [])
      .pipe(
        takeUntil(this.unsubscribe$),
        map(users => this.updateAccessControlUsers(users as User[])),
        finalize(() => this._spinner.stop())
      )
      .subscribe(
        (users: User[]) => {
          this.users = users;
          this.resetForm();
          this._toastr.success('Settings updated');
        },
        (error: HttpErrorResponse) => {
          console.error('Error while updating Access control', error);
          this._toastr.error('Error in changing');
        });
  }

  private updateAccessControlUsers(updatedUsers: User[]): User[] {
    const usersFromApi = this._accessControlService.setUsersFromApi(updatedUsers);
    return this.users.map(el => {
      const indexElement = find(usersFromApi, { id: el.id?.toString() }) as User;
      if (indexElement?.id === el.id) {
        return indexElement;
      }
      return el;
    });
  }

  private initLoginSecurityForm(): void {
    const group: any = {};
    this.users.forEach((user: User) => {
      group[user.id] = new FormGroup({
        applicationAccessLevel: new FormControl(user?.applicationAccessLevel),
        [`tradingAccess${ user.id }`]: new FormControl({ value: user?.tradingAccess, disabled: !this.isAdminRole }),
        id: new FormControl(user.id),
        selected: new FormControl({value: false, disabled: !this.isAdminRole}),
      });
    });
    this.accessControlForm = this.fb.group(group);

    this.accessControlForm.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(value => {
      this.checkSelectedUsers(value);
    });
  }

  private checkSelectedUsers(formValue: any): void {
    this.selectedUserIds = filter(formValue, x => x.selected).map(x => x.id);
    this.selectedUsersCount = this.selectedUserIds?.length;
  }

  getUserAuthTypeShort(user) {
    switch (user.authType) {
      case UserAuthType.SINGLE_FACTOR:
        return { label: '1 FA', icon: null };
      case UserAuthType.TWO_FACTOR:
        return { label: '2 FA', icon: this.getIconAuthOtpChannel(user.otpChannel) };
      case UserAuthType.SSO:
        return { label: '2 FA', icon: this.getIconAuthOtpChannel(user.otpChannel) };
    }
  }

  getIconAuthOtpChannel(otpchannel) {
    switch (otpchannel) {
      case TwoFactorType.EMAIL:
        return 'icon-pinnakl-email';
      case TwoFactorType.MOBILE:
        return 'icon-pinnakl-mobile';
      case TwoFactorType.QR:
        return 'icon-pinnakl-qr';
    }
  }


  // TODO example of updateUsersAccess with utilizing the Promise
  // private updateUsersAccess(collectionToSave: any): void {
  //   this._spinner.spin();
  //   Promise.all(collectionToSave.map(el => this._userService.putUser(el)))
  //     .then(updatedUsers => {
  //       this.users = this.updateAccessControlUsers(updatedUsers as User[]);
  //       this.resetForm();
  //       this._spinner.stop();
  //       this._toastr.success('Changes saved successfully!');
  //     })
  //     .catch(error => {
  //       console.error('Error while updating Access control', error);
  //       this._spinner.stop();
  //       this._toastr.error('Error in changing');
  //     });
  // }

  // TODO example of updateUsersAccess with the Promise with async await
  // private async updateUsersAccess2(collectionToSave: any): Promise<void> {
  //   this._spinner.spin();
  //   try {
  //     const updatedUsers = await Promise.all(collectionToSave.map(el => this._userService.putUser(el)));
  //     this.users = this.updateAccessControlUsers(updatedUsers as User[]);
  //     this.resetForm();
  //     this._toastr.success('Changes saved successfully!');
  //   } catch (error) {
  //     console.error('Error while updating Access control', error);
  //     this._toastr.error('Error in changing');
  //   }
  //   this._spinner.stop();
  // }
}
