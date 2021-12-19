import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { PositionsPnlDataFieldFromApi } from './positions-pnl-data-fields-from-api.model';
import { PositionsPnlDataField } from './positions-pnl-data-fields.model';

@Injectable()
export class PositionsPnlDataFieldsService {
  private readonly _FIELDS = ['id', 'name', 'type'];
  private readonly _positionPnlDataFieldsEndPoint =
    'entities/positions_pnl_data_fields';

  constructor(private readonly _wsp: WebServiceProvider) {}

  async getAll(): Promise<PositionsPnlDataField[]> {
    const pnlFieldsFromApi = await this._wsp.getHttp<
      PositionsPnlDataFieldFromApi[]
    >({
      endpoint: this._positionPnlDataFieldsEndPoint,
      params: {
        fields: this._FIELDS
      }
    });

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
