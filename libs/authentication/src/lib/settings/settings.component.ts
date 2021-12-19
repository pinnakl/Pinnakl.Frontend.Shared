import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '@pnkl-frontend/core';

import { ProjectNames } from '../../../../shared/src';

declare const require: any;
const packageJson = require('../../../../../package.json');

export enum SettingsTabs {
  accountSettings = 'accountSettings',
  loginSecurity = 'loginSecurity',
  notifications = 'notifications',
  accessControl = 'accessControl',
  changePassword = 'changePassword',
  CRMSettings = 'CRMSettings',
  customAttributes = 'customAttributes'
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  readonly settingsTabs = SettingsTabs;
  readonly version: string;
  user: User;
  projectName: string;
  currentTab = this.settingsTabs.accountSettings;

  constructor(private readonly _activatedRoute: ActivatedRoute) {
    this.projectName = this._activatedRoute.snapshot.data.projectName;
    this.user = this._activatedRoute.snapshot.data.resolveData;
    this.version = packageJson.version;
  }

  switchTab(selectedTab: SettingsTabs): void {
    this.currentTab = selectedTab;
  }

  updateUser(user: User): void {
    this.user = user;
  }

  get ProjectNames() {
    return ProjectNames;
  }
}
