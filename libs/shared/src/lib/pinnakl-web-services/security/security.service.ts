import { Injectable } from '@angular/core';

import {
  GetWebRequest,
  WebServiceProvider,
  WebSocketMessageFilter,
} from '@pnkl-frontend/core';
import {
  SecurityMarketFlattened,
  SecurityMarketFlattenedFromAPI,
} from '../../models/security/security-market-flattened.model';
import { AssetType } from '../../models/security/asset-type.model';
import { SecurityAttributeOptionFromApi } from '../../models/security/security-attribute-option-from-api.model';
import { SecurityAttributeOption } from '../../models/security/security-attribute-option.model';
import { SecurityFromApi } from '../../models/security/security-from-api.model';
import { SecurityTypeFromApi } from '../../models/security/security-type-from-api.model';
import { SecurityType } from '../../models/security/security-type.model';
import { Security } from '../../models/security/security.model';
import { HttpClient } from '@angular/common/http';
import { initial } from 'lodash';
import * as moment from 'moment';

@Injectable()
export class SecurityService {
  private readonly RESOURCE_URL = 'securities';
  private readonly ASSETTYPE_URL = 'asset_types';
  private readonly SECURITYTYPE_URL = 'security_types';
  private readonly SECURITY_IDENTIFIERS_FLATTENED_RESOURCE_URL =
    'security_identifiers_flattened';

  private _assetTypes: AssetType[];
  private _securities: Security[];
  private _securityTypes: SecurityType[];

  constructor(private wsp: WebServiceProvider, private http: HttpClient) {}

  getAllSecurities(): Promise<Security[]> {
    if (this._securities) {
      return Promise.resolve(this._securities);
    }

    const fields = [
      'Id',
      'AssetType',
      'AssetTypeId',
      'SecType',
      'secTypeId',
      'SecTypeDescription',
      'Ticker',
      'Cusip',
      'Sedol',
      'LoanId',
      'OpraCode',
      'Isin',
      'Description',
      'PrivateIndicator',
      'CurrencyId',
      'Currency',
      'Multiplier',
      'Principal_Factor',
      'InitialMargin',
      'MaintenanceMargin',
      'Maturity',
    ];

    const filters: WebSocketMessageFilter[] = [];
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields: fields,
      },
    };

    return this.wsp.get(getWebRequest).then((entities: SecurityFromApi[]) => {
      this._securities = entities.map((entity) => this.formatSecurity(entity));
      return this._securities;
    });
  }

  getAllTradingSecurities(): Promise<Security[]> {
    const SECURITIES_URL = 'securities';
    return this.http
      .get(SECURITIES_URL)
      .toPromise()
      .then((securitiesApiData: SecurityFromApi[]) => {
        const securities = securitiesApiData.map((p) => this.formatSecurity(p));
        return securities;
      });
  }

  getSecurityHTTP(id: number): Promise<Security> {
    const SECURITIES_URL = `https://localhost:44323/api/securities/${id}`;
    return this.http
      .get(SECURITIES_URL)
      .toPromise()
      .then((securityApiData: SecurityFromApi) => {
        return this.formatSecurity(securityApiData);
      });
  }

  getAllSecuritiesFlattened(
    activeTradingIndicator: boolean = null,
    assetType: string = null,
    securityMarketId: number = null
  ): Promise<SecurityMarketFlattened[]> {
    const filters: WebSocketMessageFilter[] = [];
    if (assetType) {
      filters.push({ key: 'assettype', type: 'EQ', value: [assetType] });
    }
    if (activeTradingIndicator) {
      filters.push({
        key: 'active_trading_indicator',
        type: 'EQ',
        value: ['1'],
      });
    }
    if (securityMarketId) {
      filters.push({
        key: 'securityMarketId',
        type: 'EQ',
        value: [securityMarketId.toString()],
      });
    }
    const fields = [
        'securityid',
        'marketid',
        'securitymarketid',
        'assettype',
        'assettypeid',
        'sectypeid',
        'sectype',
        'ticker',
        'cusip',
        'isin',
        'sedol',
        'loanid',
        'opracode',
        'description',
        'multiplier',
        'currency',
        'currencyid',
        'privateIndicator',
      ],
      getWebRequest: GetWebRequest = {
        endPoint: this.SECURITY_IDENTIFIERS_FLATTENED_RESOURCE_URL,
        options: { fields, filters },
      };
    return this.wsp
      .get(getWebRequest)
      .then((securities: SecurityMarketFlattenedFromAPI[]) =>
        securities.map((sec) => this.formatSecurityMarketFlattened(sec))
      );
  }

  getAssetTypes(): Promise<AssetType[]> {
    if (this._assetTypes) {
      return Promise.resolve(this._assetTypes);
    }

    const fields = ['id', 'assettype', 'daysforsettlement', 'multiplier'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.ASSETTYPE_URL,
      options: {
        fields: fields,
      },
    };

    return this.wsp.get(getWebRequest).then((assetTypes) => {
      this._assetTypes = assetTypes.map((x) => {
        return new AssetType(
          +x.id,
          x.assettype,
          +x.daysforsettlement,
          x.multiplier
        );
      });
      return this._assetTypes;
    });
  }

  getSecurity(id: number): Promise<Security> {
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: { id: id.toString() },
    };
    return this.wsp
      .get(getWebRequest)
      .then((entities: SecurityFromApi[]) => this.formatSecurity(entities[0]));
  }

  getSecurityAttributeOptions(
    attribute: string,
    isNumeric?: boolean
  ): Promise<SecurityAttributeOption[]> {
    attribute = attribute.replace(/ /g, '%20');
    const fields = ['optionvalue', 'optiondescription'],
      getWebRequest: GetWebRequest = {
        endPoint: 'security_attribute_options',
        options: {
          fields,
          filters: [{ key: 'attribute', type: 'EQ', value: [attribute] }],
        },
      };
    return this.wsp
      .get(getWebRequest)
      .then((entities: SecurityAttributeOptionFromApi[]) => {
        let securityAttributeOptions = entities.map((entity) =>
          this.formatSecurityAttributeOption(entity)
        );
        if (isNumeric) {
          for (let securityAttributeOption of securityAttributeOptions) {
            let optionValue = parseInt(
              <string>securityAttributeOption.optionValue
            );
            securityAttributeOption.optionValue = !isNaN(optionValue)
              ? optionValue
              : null;
          }
        }
        return securityAttributeOptions;
      });
  }

  getSecurityTypes(): Promise<SecurityType[]> {
    if (this._securityTypes) {
      return Promise.resolve(this._securityTypes);
    }

    const fields = ['id', 'AssetTypeId', 'SecType', 'SecTypeDescription'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.SECURITYTYPE_URL,
      options: {
        fields: fields,
      },
    };

    return this.wsp.get(getWebRequest).then((entities) => {
      this._securityTypes = entities.map((entity) =>
        this.formatSecurityType(entity)
      );
      return this._securityTypes;
    });
  }

  getSecurityTypesForAssetType(assetTypeId: number): Promise<SecurityType[]> {
    return this.getSecurityTypes().then((securityTypes) => {
      return securityTypes.filter(
        (secType) => secType.assetTypeId === assetTypeId
      );
    });
  }

  postSecurity(entityToSave: Security): Promise<Security> {
    let requestBody = this.getSecurityForServiceRequest(entityToSave);
    return this.wsp
      .post({
        endPoint: this.RESOURCE_URL,
        payload: requestBody,
      })
      .then((entity: SecurityFromApi) => this.formatSecurity(entity));
  }

  putSecurity(entityToSave: Security): Promise<Security> {
    let requestBody = this.getSecurityForServiceRequest(entityToSave);
    return this.wsp
      .put({
        endPoint: this.RESOURCE_URL,
        payload: requestBody,
      })
      .then((entity: SecurityFromApi) => this.formatSecurity(entity));
  }

  async saveSecurityAutomatically(
    autoAdd: boolean,
    identifierType: string,
    identifierValue: string
  ): Promise<Security> {
    try {
      const securityFromApi: SecurityFromApi = await this.wsp.post({
        endPoint: this.RESOURCE_URL,
        payload: { autoAdd, identifierType, identifierValue },
      });
      const security = this.formatSecurity(securityFromApi);
      return security;
    } catch (e) {
      if (e.message && e.message.toLowerCase().includes('mandatory fields')) {
        throw { clientMessage: e.message };
      }
      throw e;
    }
  }

  private formatSecurity(entity: SecurityFromApi): Security {
    const assetTypeId = +entity.assettypeid,
      currencyId = +entity.currencyid,
      dataSourceId = +entity.datasource,
      id = +entity.id,
      multiplier = +entity.multiplier,
      organizationId = +entity.organization_id,
      securityTypeId = +entity.sectypeid,
      principalFactor = parseFloat(entity.principal_factor),
      initialMargin = parseFloat(entity.initialmargin),
      maintenanceMargin = parseFloat(entity.maintenancemargin),
      maturityMoment = moment(entity.maturity, 'MM/DD/YYYY');

    return new Security(
      entity.assettype,
      !isNaN(assetTypeId) ? assetTypeId : null,
      entity.countryofincorporation,
      entity.countryofrisk,
      entity.currency,
      !isNaN(currencyId) ? currencyId : null,
      entity.cusip,
      !isNaN(dataSourceId) ? dataSourceId : null,
      entity.description,
      !isNaN(id) ? id : null,
      entity.isin,
      entity.loanid,
      entity.manualpricingindicator === 'True',
      entity.moodyrating,
      !isNaN(multiplier) ? multiplier : null,
      entity.opracode,
      !isNaN(organizationId) ? organizationId : null,
      entity.organizationname,
      entity.organization_status_descr,
      entity.organization_status_id,
      entity.organizationticker,
      entity.privateindicator === 'True',
      entity.sandprating,
      entity.sector,
      entity.sectype,
      entity.sectypedescription,
      !isNaN(securityTypeId) ? securityTypeId : null,
      entity.sedol,
      entity.ticker,
      !isNaN(principalFactor) ? principalFactor : null,
      !isNaN(initialMargin) ? initialMargin : null,
      !isNaN(maintenanceMargin) ? maintenanceMargin : null,
      maturityMoment.isValid() ? maturityMoment.toDate() : null
    );
  }

  private formatSecurityMarketFlattened(sec: SecurityMarketFlattenedFromAPI) {
    return {
      securityMarketId: +sec.securitymarketid,
      securityId: +sec.securityid,
      marketId: +sec.marketid,
      assetType: sec.assettype,
      assetTypeId: +sec.assettypeid,
      currency: sec.currency,
      currencyId: +sec.currencyid,
      cusip: sec.cusip,
      description: sec.description,
      isin: sec.isin,
      loanId: sec.loanid,
      multiplier: +sec.multiplier,
      opraCode: sec.opracode,
      privateIndicator: sec.privateindicator === 'True',
      secType: sec.sectype,
      secTypeId: +sec.sectypeid,
      sedol: sec.sedol,
      ticker: sec.ticker,
    };
  }

  private formatSecurityAttributeOption(
    entity: SecurityAttributeOptionFromApi
  ): SecurityAttributeOption {
    let id = parseInt(entity.id);
    return new SecurityAttributeOption(
      !isNaN(id) ? id : null,
      entity.optiondescription,
      entity.optionvalue
    );
  }

  private formatSecurityType(entity: SecurityTypeFromApi): SecurityType {
    let assetTypeId = parseInt(entity.assettypeid),
      id = parseInt(entity.id);
    return new SecurityType(
      !isNaN(assetTypeId) ? assetTypeId : null,
      !isNaN(id) ? id : null,
      entity.sectype,
      entity.sectypedescription
    );
  }

  private getSecurityForServiceRequest(entity: Security): SecurityFromApi {
    let entityForApi = {} as SecurityFromApi,
      {
        currencyId,
        dataSourceId,
        description,
        id,
        manualPricingIndicator,
        multiplier,
        organizationId,
        privateIndicator,
        sandpRating,
        sector,
        securityTypeId,
      } = entity;

    if (currencyId !== undefined) {
      entityForApi.currencyid = currencyId.toString();
    }
    if (dataSourceId !== undefined) {
      entityForApi.datasource = dataSourceId.toString();
    }
    if (description !== undefined) {
      entityForApi.description = description;
    }
    if (id !== undefined) {
      entityForApi.id = id.toString();
    }
    if (manualPricingIndicator !== undefined) {
      entityForApi.manualpricingindicator = manualPricingIndicator ? '1' : '0';
    }
    if (multiplier !== undefined) {
      entityForApi.multiplier = multiplier.toString();
    }
    if (organizationId !== undefined) {
      entityForApi['organizationid'] = organizationId.toString();
    }
    if (privateIndicator !== undefined) {
      entityForApi.privateindicator = privateIndicator ? '1' : '0';
    }
    if (sandpRating !== undefined) {
      entityForApi.sandprating = sandpRating;
    }
    if (sector !== undefined) {
      entityForApi.sector = sector;
    }
    if (securityTypeId !== undefined) {
      entityForApi.sectypeid = securityTypeId.toString();
    }
    return entityForApi;
  }
}
