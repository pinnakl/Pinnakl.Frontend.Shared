import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { OptionFromApi } from '../../models/security/option-from-api.model';
import { Option } from '../../models/security/option.model';

@Injectable()
export class OptionService {
  private readonly RESOURCE_URL = 'options';

  constructor(private wsp: WebServiceProvider) {}

  getOptionFromSecurityId(securityId: number): Promise<Option> {
    let fields = [
      'Contract_Size',
      'Id',
      'Maturity',
      'Option_Type',
      'Put_Call_Indicator',
      'SecurityId',
      'Strike',
      'UnderlyingSecurityId'
    ];

    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields: fields,
        filters: [
          {
            key: 'securityid',
            type: 'EQ',
            value: [securityId.toString()]
          }
        ]
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then((entities: OptionFromApi[]) =>
        entities.length === 0 ? null : this.formatOption(entities[0])
      );
  }

  postOption(entityToSave: Option): Promise<Option> {
    let requestBody = this.getOptionForServiceRequest(entityToSave);

    return this.wsp
      .post({
        endPoint: this.RESOURCE_URL,
        payload: requestBody
      })
      .then((entity: OptionFromApi) => this.formatOption(entity));
  }

  putOption(entityToSave: Option): Promise<Option> {
    let requestBody = this.getOptionForServiceRequest(entityToSave);
    return this.wsp
      .put({
        endPoint: this.RESOURCE_URL,
        payload: requestBody
      })
      .then((entity: OptionFromApi) => this.formatOption(entity));
  }

  private formatOption(entity: OptionFromApi): Option {
    let contractSize = parseInt(entity.contract_size),
      id = parseInt(entity.id),
      maturityMoment = moment(entity.maturity, 'MM/DD/YYYY'),
      optionType = entity.option_type,
      putCallIndiactor = entity.put_call_indicator,
      securityId = parseInt(entity.securityid),
      strike = parseFloat(entity.strike),
      underLyingSecurityId = parseInt(entity.underlyingsecurityid);
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
    let entityForApi = {} as OptionFromApi,
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
