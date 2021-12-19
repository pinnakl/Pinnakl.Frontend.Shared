import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { Option } from '../../models/security';
import { OptionFromApi } from '../../models/security/option-from-api.model';

@Injectable()
export class OptionService {
  private readonly _optionsEndpoint = 'entities/options';

  constructor(private readonly wsp: WebServiceProvider) { }

  async getOptionFromSecurityId(securityId: number): Promise<Option> {
    const fields = [
      'Contract_Size',
      'Id',
      'Maturity',
      'Option_Type',
      'Put_Call_Indicator',
      'SecurityId',
      'Strike',
      'UnderlyingSecurityId'
    ];

    const options = await this.wsp.getHttp<OptionFromApi[]>({
      endpoint: this._optionsEndpoint,
      params: {
        fields: fields,
        filters: [
          {
            key: 'securityid',
            type: 'EQ',
            value: [securityId.toString()]
          }
        ]
      }
    });
    return options.length === 0 ? null : this.formatOption(options[0]);
  }

  async postOption(entityToSave: Option): Promise<Option> {
    const entity = await this.wsp.postHttp<OptionFromApi>({
      endpoint: this._optionsEndpoint,
      body: this.getOptionForServiceRequest(entityToSave)
    });

    return this.formatOption(entity);
  }

  async putOption(entityToSave: Option): Promise<Option> {
    const entity = await this.wsp.putHttp<OptionFromApi>({
      endpoint: this._optionsEndpoint,
      body: this.getOptionForServiceRequest(entityToSave)
    });

    return this.formatOption(entity);
  }

  private formatOption(entity: OptionFromApi): Option {
    const contractSize = parseInt(entity.contract_size, 10),
      id = parseInt(entity.id, 10),
      maturityMoment = moment(entity.maturity, 'MM/DD/YYYY'),
      optionType = entity.option_type,
      putCallIndiactor = entity.put_call_indicator,
      securityId = parseInt(entity.securityid, 10),
      strike = parseFloat(entity.strike),
      underLyingSecurityId = parseInt(entity.underlyingsecurityid, 10);
    return new Option(
      !isNaN(contractSize) ? contractSize : null,
      !isNaN(id) ? id : null,
      maturityMoment.isValid() ? maturityMoment.toDate() : null,
      optionType,
      putCallIndiactor,
      !isNaN(securityId) ? securityId : null,
      !isNaN(strike) ? strike : null,
      !isNaN(underLyingSecurityId) ? underLyingSecurityId : null
    );
  }

  private getOptionForServiceRequest(entitiy: Option): OptionFromApi {
    const entityForApi = {} as OptionFromApi,
      {
        contractSize,
        id,
        maturity,
        optionType,
        putCallIndicator,
        securityId,
        strike,
        underlyingSecurityId
      } = entitiy;
    if (contractSize !== undefined) {
      entityForApi.contract_size =
        contractSize !== null ? contractSize.toString() : null;
    }
    if (id !== undefined) {
      entityForApi.id = id.toString();
    }
    if (maturity !== undefined) {
      entityForApi.maturity =
        maturity !== null ? moment(maturity).format('MM/DD/YYYY') : 'null';
    }
    if (optionType !== undefined) {
      entityForApi.option_type = optionType !== null ? optionType : 'null';
    }
    if (putCallIndicator !== undefined) {
      entityForApi.put_call_indicator =
        putCallIndicator !== null ? putCallIndicator : 'null';
    }
    if (securityId !== undefined) {
      entityForApi.securityid = securityId.toString();
    }
    if (strike !== undefined) {
      entityForApi.strike = strike !== null ? strike.toString() : 'null';
    }
    if (underlyingSecurityId !== undefined) {
      entityForApi.underlyingsecurityid =
        underlyingSecurityId !== null
          ? underlyingSecurityId.toString()
          : 'null';
    }
    return entityForApi;
  }
}
