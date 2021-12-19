import { Injectable } from '@angular/core';

import { UserService, WebServiceProvider } from '@pnkl-frontend/core';
import { UserModuleConfig } from '../../../models/user-module-config';
import { UserScreenSetting } from './user-screen-setting.model';

@Injectable()
export class UserScreenSettingsService {
  private readonly _userModuleConfig = 'entities/user_module_configs';
  readonly PnLDashboardConfigName = 'widgets';
  readonly PnLDashboardModule = 'PNL_DASHBOARD_WIDGETS';

  constructor(private readonly wsp: WebServiceProvider, private readonly userService: UserService) { }

  async getAll(): Promise<UserScreenSetting[]> {
    const user = this.userService.getUser();
    const entitiesFromApi: UserModuleConfig[] = await this.wsp.getHttp({
      endpoint: this._userModuleConfig,
      params: {
        fields: [ 'id', 'userid', 'module', 'configname', 'configvalue' ],
        filters: [
          {
            key: 'userid',
            type: 'EQ',
            value: [ user.id.toString() ]
          },
          {
            key: 'configname',
            type: 'EQ',
            value: [ this.PnLDashboardConfigName ]
          },
          {
            key: 'module',
            type: 'EQ',
            value: [ this.PnLDashboardModule ]
          }
        ]
      }
    });
    return entitiesFromApi.map((setting: UserModuleConfig) => this.formatUserScreenSetting(setting));
  }

  async post(entity: Partial<UserScreenSetting>): Promise<UserScreenSetting> {
    const entityFromApi: UserModuleConfig = await this.wsp.postHttp({
      endpoint: this._userModuleConfig,
      body: this.getUserScreenSettingForServiceRequest(entity)
    });
    return this.formatUserScreenSetting(entityFromApi);
  }

  async put(entity: Partial<UserScreenSetting>): Promise<UserScreenSetting> {
    const entityFromApi: UserModuleConfig = await this.wsp.putHttp({
      endpoint: this._userModuleConfig,
      body: this.getUserScreenSettingForServiceRequest(entity)
    });
    return this.formatUserScreenSetting(entityFromApi);
  }

  private formatUserScreenSetting(config: UserModuleConfig): UserScreenSetting {
    const configValue = JSON.parse(config.configvalue);
    return {
      id: +config.id,
      screen: configValue.screen,
      setting: configValue.setting,
      settingValue: this.formatUserScreenSettingValue(configValue.setting, configValue.settingvalue)
    };
  }

  private formatUserScreenSettingValue(setting: string, settingValue: string): number | number[] | string | string[] {
    switch ( setting.toLowerCase() ) {
      case 'widget ids':
        return settingValue.split(',').map(id => +id);
      default:
        throw new Error('Invalid setting');
    }
  }

  private getUserScreenSettingForServiceRequest({ id, screen, setting, settingValue }: Partial<UserScreenSetting>): UserModuleConfig {
    const userSetting = {} as UserModuleConfig;
    const configValue = {} as any;
    userSetting.module = this.PnLDashboardModule;
    userSetting.configname = this.PnLDashboardConfigName;
    userSetting.userid = this.userService.getUser().id.toString();
    if (id) {
      userSetting.id = id.toString();
    }
    if (screen) {
      configValue.screen = screen;
    }
    if (setting) {
      configValue.setting = setting;
    }
    if (settingValue) {
      configValue.settingvalue = this.getUserScreenSettingValueForServiceRequest(setting, settingValue);
    }
    userSetting.configvalue = JSON.stringify(configValue);
    if (!Object.keys(userSetting).length) {
      throw new Error('Invalid entity');
    }
    return userSetting;
  }

  private getUserScreenSettingValueForServiceRequest(setting: string, settingValue: number | number[] | string | string[]): string {
    switch ( setting.toLowerCase() ) {
      case 'widget ids':
        return (<number[]> settingValue).join(',');
      default:
        throw new Error('Invalid setting');
    }
  }
}
