import { Injectable } from '@angular/core';

import { UserService, WebServiceProvider } from '@pnkl-frontend/core';
import { UserScreenSettingFromApi } from './user-screen-setting-from-api.model';
import { UserScreenSetting } from './user-screen-setting.model';

@Injectable()
export class UserScreenSettingsService {
  private readonly RESOURCE_URL = 'user_screen_settings';
  constructor(
    private wsp: WebServiceProvider,
    private userService: UserService
  ) {}

  async getAll(): Promise<UserScreenSetting[]> {
    const user = this.userService.getUser();
    const entitiesFromApi: UserScreenSettingFromApi[] = await this.wsp.get({
      endPoint: this.RESOURCE_URL,
      options: {
        fields: ['screen', 'setting', 'settingValue'],
        filters: [
          {
            key: 'userId',
            type: 'EQ',
            value: [user.id.toString()]
          }
        ]
      }
    });
    const entities = entitiesFromApi.map(formatUserScreenSetting);
    return entities;
  }

  async post(entity: Partial<UserScreenSetting>): Promise<UserScreenSetting> {
    const entityForServiceRequest = getUserScreenSettingForServiceRequest(
      entity
    );
    const entityFromApi: UserScreenSettingFromApi = await this.wsp.post({
      endPoint: this.RESOURCE_URL,
      payload: entityForServiceRequest
    });
    const savedEntity = formatUserScreenSetting(entityFromApi);
    return savedEntity;
  }

  async put(entity: Partial<UserScreenSetting>): Promise<UserScreenSetting> {
    const entityForServiceRequest = getUserScreenSettingForServiceRequest(
      entity
    );
    const entityFromApi: UserScreenSettingFromApi = await this.wsp.put({
      endPoint: this.RESOURCE_URL,
      payload: entityForServiceRequest
    });
    const savedEntity = formatUserScreenSetting(entityFromApi);
    return savedEntity;
  }
}

function formatUserScreenSetting({
  id,
  screen,
  setting,
  settingvalue
}: UserScreenSettingFromApi): UserScreenSetting {
  return {
    id: +id,
    screen,
    setting,
    settingValue: formatUserScreenSettingValue(setting, settingvalue)
  };
}

function formatUserScreenSettingValue(
  setting: string,
  settingValue: string
): number | number[] | string | string[] {
  switch (setting.toLowerCase()) {
    case 'widget ids':
      return settingValue.split(',').map(id => +id);
    default:
      throw new Error('Invalid setting');
  }
}

function getUserScreenSettingForServiceRequest({
  id,
  screen,
  setting,
  settingValue
}: Partial<UserScreenSetting>): UserScreenSettingFromApi {
  const entityForApi = {} as UserScreenSettingFromApi;
  if (id) {
    entityForApi.id = id.toString();
  }
  if (screen) {
    entityForApi.screen = screen;
  }
  if (setting) {
    entityForApi.setting = setting;
  }
  if (settingValue) {
    entityForApi.settingvalue = getUserScreenSettingValueForServiceRequest(
      setting,
      settingValue
    );
  }
  if (!Object.keys(entityForApi).length) {
    throw new Error('Invalid entity');
  }
  return entityForApi;
}

function getUserScreenSettingValueForServiceRequest(
  setting: string,
  settingValue: number | number[] | string | string[]
): string {
  switch (setting.toLowerCase()) {
    case 'widget ids':
      return (<number[]>settingValue).join(',');
    default:
      throw new Error('Invalid setting');
  }
}
