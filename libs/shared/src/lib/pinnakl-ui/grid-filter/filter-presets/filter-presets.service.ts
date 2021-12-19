import { Injectable } from '@angular/core';
import { WebServiceProvider } from '@pnkl-frontend/core';
import { clone, isEmpty } from 'lodash';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class Preset {
  constructor(
    public id: number,
    public presetName: string,
    public presetConfig: any,
    public showDelete: boolean
  ) {}
}

export const preset_config_name = 'preset';

export enum AllowedPresetsPage {
  OMS = 'OMS',
  EMS = 'EMS'
}

@Injectable()
export class FilterPresetsService {
  private readonly _presetsEndpoint = 'entities/user_module_configs';

  constructor(private readonly wsp: WebServiceProvider) { }

  getPresets(userId: number, module: AllowedPresetsPage): Observable<any[]> {
    return from(this.wsp.getHttp<any[]>({
      endpoint: this._presetsEndpoint,
      params: {
        fields: [ 'id', 'userid', 'module', 'configname', 'configvalue' ],
        filters: [
          {
            key: 'userid',
            type: 'EQ',
            value: [ userId.toString() ]
          },
          {
            key: 'configname',
            type: 'EQ',
            value: [ preset_config_name ]
          },
          {
            key: 'module',
            type: 'EQ',
            value: [ module ]
          }
        ]
      },
    })).pipe(map((presets => !isEmpty(presets) ? this.setPresetsFromApi(presets) : null)));
  }


  createPreset(preset: any): Observable<any[]> {
    return from(this.wsp.postHttp<any>({ endpoint: this._presetsEndpoint, body: preset }));
  }

  deletePreset(presetId: number): Observable<void> {
    return from(this.wsp.deleteHttp<void>({ endpoint: `${this._presetsEndpoint}/${presetId}`}));
  }

  private setPresetsFromApi(presetsFromApi: any[]): Preset[] {
    return presetsFromApi.map((preset: any) => {
      const presetConfig = JSON.parse(preset.configvalue);
      const presetName = clone(presetConfig.presetname);
      delete presetConfig.presetname;
      return new Preset(
        +preset.id,
        presetName,
        presetConfig,
        false
      );
    });
  }

}
