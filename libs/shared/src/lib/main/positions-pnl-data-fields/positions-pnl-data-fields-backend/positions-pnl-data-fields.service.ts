import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { PositionsPnlDataFieldFromApi } from './positions-pnl-data-fields-from-api.model';
import { PositionsPnlDataField } from './positions-pnl-data-fields.model';

@Injectable()
export class PositionsPnlDataFieldsService {
  private readonly _FIELDS = ['id', 'name', 'type'];
  private readonly _RESOURCE_URL = 'positions_pnl_data_fields';

  constructor(private _wsp: WebServiceProvider) {}

  async getAll(): Promise<PositionsPnlDataField[]> {
    const pnlFieldsFromApi: PositionsPnlDataFieldFromApi[] = await this._wsp.get(
      {
        endPoint: this._RESOURCE_URL,
        options: { fields: this._FIELDS }
      }
    );
    const pnlFields = pnlFieldsFromApi.map(this._formatPnlField);
    return pnlFields;
  }

  private _formatPnlField(
    entityFromApi: PositionsPnlDataFieldFromApi
  ): PositionsPnlDataField {
    return {
      ...entityFromApi,
      id: +entityFromApi.id,
      field:
        entityFromApi.type === 'security'
          ? entityFromApi.name.charAt(0).toLowerCase() +
            entityFromApi.name.slice(1)
          : entityFromApi.name
    };
  }
}
