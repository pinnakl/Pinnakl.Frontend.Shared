import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import {
  WebServiceProvider,
  WebSocketMessageFilter
} from '@pnkl-frontend/core';
import * as moment from 'moment';
import { from, Observable } from 'rxjs';
import { AssetType } from '../../models/security/asset-type.model';
import { SecurityAttributeOptionFromApi } from '../../models/security/security-attribute-option-from-api.model';
import { SecurityAttributeOption } from '../../models/security/security-attribute-option.model';
import { SecurityFromApi } from '../../models/security/security-from-api.model';
import {
  SecurityMarketFlattened,
  SecurityMarketFlattenedFromAPI
} from '../../models/security/security-market-flattened.model';
import { SecurityTypeFromApi } from '../../models/security/security-type-from-api.model';
import { SecurityType } from '../../models/security/security-type.model';
import { Security } from '../../models/security/security.model';

@Injectable()
export class SecurityService {
  private readonly _securitiesEndpoint = 'entities/securities';
  private readonly _securitiesSearchEndpoint = 'entities/security_search';
  private readonly _assetTypesEndpoint = 'entities/asset_types';
  private readonly _securityAttributesEndpoint = 'entities/security_attribute_options';
  private readonly _securityTypesEndpoint = 'entities/security_types';
  private readonly _securityIdentifiersFlattenedEndpoint = 'entities/security_identifiers_flattened';
  private readonly _securityIdentifiersTickerSearchEndpoint = 'entities/idc_ticker_search';

  private _assetTypes: AssetType[];
  private _securities: Security[];
  private _securityTypes: SecurityType[];

  constructor(private readonly wsp: WebServiceProvider, private readonly http: HttpClient) { }

  getCusipsByTicker(identifier: string): Observable<any> {
    return from(this.wsp.getHttp({
      endpoint: this._securityIdentifiersTickerSearchEndpoint,
      params: { filters: [{ key: 'ticker', type: 'EQ', value: [identifier] }] }
    }));
  }

  getAllSecurities(): Promise<Security[]> {
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
      'underlyingsecid'
    ];

    return this.wsp
      .getHttp<SecurityFromApi[]>({
        endpoint: this._securitiesEndpoint,
        params: { fields }
      })
      .then(entities => {
        this._securities = entities.map(entity => this.formatSecurity(entity));
        return this._securities;
      });
  }

  getAllTradingSecurities(): Promise<Security[]> {
    const SECURITIES_URL = 'securities';
    return this.http
      .get(SECURITIES_URL)
      .toPromise()
      .then((securitiesApiData: SecurityFromApi[]) => {
        const securities = securitiesApiData.map(p => this.formatSecurity(p));
        return securities;
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
        value: ['1']
      });
    }
    if (securityMarketId) {
      filters.push({
        key: 'securityMarketId',
        type: 'EQ',
        value: [securityMarketId.toString()]
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
      'privateIndicator'
    ];

    return this.wsp
      .getHttp<SecurityMarketFlattenedFromAPI[]>({
        endpoint: this._securityIdentifiersFlattenedEndpoint,
        params: {
          fields,
          filters
        }
      })
      .then(securities => securities.map(this.formatSecurityMarketFlattened));
  }

  async getSecuritiesByText(
    text: string,
    assetType: string,
    additionalFilters: {
      key: string;
      type: string;
      value: string[];
    }[] = [], includeCheckForExpiration = false): Promise<SecurityMarketFlattened[]> {
    const filters = [
      { 'key': 'searchstring', 'type': 'LIKE', 'value': [text] }
    ].concat(additionalFilters);
    if (assetType) {
      filters.push({ 'key': 'assettype', 'type': 'EQ', 'value': [assetType] });
      if (includeCheckForExpiration) {
        filters.push({ 'key': 'checkforexpiration', 'type': 'EQ', 'value': [`${(assetType === 'option').toString()}`] },)
      }
    }
    const securities = await this.wsp
      .getHttp<SecurityMarketFlattenedFromAPI[]>({
        endpoint: this._securitiesSearchEndpoint,
        params: {
          filters
        }
      });
    return securities.map(this.formatSecurityMarketFlattened);
  }

  formatAndSetSecurities(securitiesFromApi: SecurityFromApi[]): Security[] {
    this._securities = securitiesFromApi.map(entity =>
      this.formatSecurity(entity)
    );
    return this._securities;
  }

  getAssetTypes(): Promise<AssetType[]> {
    if (this._assetTypes) {
      return Promise.resolve(this._assetTypes);
    }

    return this.wsp
      .getHttp<any[]>({
        endpoint: this._assetTypesEndpoint,
        params: {
          fields: ['id', 'assettype', 'daysforsettlement', 'multiplier']
        }
      })
      .then(assetTypes => {
        this._assetTypes = assetTypes.map(x => {
          return this.formatAssetType(x);
        });
        return this._assetTypes;
      });
  }

  public formatAssetType(assetTypeFromApi: any): AssetType {
    return new AssetType(
      +assetTypeFromApi.id,
      assetTypeFromApi.assettype,
      +assetTypeFromApi.daysforsettlement,
      assetTypeFromApi.multiplier
    );
  }

  public formatAndSetAssetTypes(assetTypesFromApi: any[]): AssetType[] {
    this._assetTypes = assetTypesFromApi.map(entity =>
      this.formatAssetType(entity)
    );

    return this._assetTypes;
  }

  getSecurity(id: number): Promise<Security> {
    return this.wsp
      .getHttp<SecurityFromApi>({
        endpoint: this._securitiesEndpoint,
        params: { id: id.toString() }
      })
      .then(entities => this.formatSecurity(entities));
  }

  getSecurityAttributeOptions(
    attribute: string,
    isNumeric?: boolean
  ): Promise<SecurityAttributeOption[]> {
    attribute = attribute.replace(/ /g, '%20');
    return this.wsp
      .getHttp<SecurityAttributeOptionFromApi[]>({
        endpoint: this._securityAttributesEndpoint,
        params: {
          fields: ['optionvalue', 'optiondescription'],
          filters: [{ key: 'attribute', type: 'EQ', value: [attribute] }]
        }
      })
      .then(entities => {
        let securityAttributeOptions = entities.map(entity =>
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

    return this.wsp
      .getHttp<SecurityTypeFromApi[]>({
        endpoint: this._securityTypesEndpoint,
        params: {
          fields: ['id', 'AssetTypeId', 'SecType', 'SecTypeDescription']
        }
      })
      .then(entities => {
        this._securityTypes = entities.map(this.formatSecurityType);
        return this._securityTypes;
      });
  }

  getSecurityTypesForAssetType(assetTypeId: number): Promise<SecurityType[]> {
    return this.getSecurityTypes().then(securityTypes => {
      return securityTypes.filter(
        secType => secType.assetTypeId === assetTypeId
      );
    });
  }

  postSecurity(entityToSave: Security): Promise<Security> {
    const requestBody = this.getSecurityForServiceRequest(entityToSave);
    return this.wsp
      .postHttp<SecurityFromApi>({
        endpoint: this._securitiesEndpoint,
        body: requestBody
      })
      .then((entity: SecurityFromApi) => this.formatSecurity(entity));
  }

  putSecurity(entityToSave: Security): Promise<Security> {
    const requestBody = this.getSecurityForServiceRequest(entityToSave);
    return this.wsp
      .putHttp<SecurityFromApi>({
        endpoint: this._securitiesEndpoint,
        body: requestBody
      })
      .then((entity: SecurityFromApi) => this.formatSecurity(entity));
  }

  async saveSecurityAutomatically(
    autoAdd: boolean,
    identifierType: string,
    identifierValue: string
  ): Promise<Security> {
    try {
      const securityFromApi = await this.wsp.postHttp<SecurityFromApi>({
        endpoint: this._securitiesEndpoint,
        body: {
          autoAdd: autoAdd === true ? 'true' : 'false',
          identifierType: identifierType,
          identifierValue: identifierValue
        }
      });
      return this.formatSecurity(securityFromApi);
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
      maturityMoment.isValid() ? maturityMoment.toDate() : null,
      entity.underlyingsecid ? +entity.underlyingsecid : null
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
      position: sec.position,
      id: +sec.securityid
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
    const id = parseInt(entity.id, 10);
    const assetTypeId = parseInt(entity.assettypeid, 10);
    return new SecurityType(
      !isNaN(assetTypeId) ? assetTypeId : null,
      !isNaN(id) ? id : null,
      entity.sectype,
      entity.sectypedescription
    );
  }

  private getSecurityForServiceRequest(entity: Security): SecurityFromApi {
    const entityForApi = {} as SecurityFromApi,
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
        securityTypeId
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
