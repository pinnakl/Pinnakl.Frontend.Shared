import { Injectable } from '@angular/core';
import { WebServiceProvider } from '@pnkl-frontend/core';
import { from, Observable } from 'rxjs';

@Injectable()
export class PositionsSharePresetsService {
  private readonly _presetsEndpoint = 'entities/user_module_configs';
  private readonly presetConfigName = 'pms_grid_config';
  private readonly presetConfigModule = 'PMS';

  constructor(private readonly wsp: WebServiceProvider) {
  }

  sharePreset(userId: number, presetValue: any): Observable<any[]> {
    const presetToShare = {
      configname: this.presetConfigName,
      module: this.presetConfigModule,
      userid: userId.toString(),
      configvalue: JSON.stringify(presetValue)
    };

    return from(this.wsp.postHttp<any>({ endpoint: this._presetsEndpoint, body: presetToShare }));
  }
}
