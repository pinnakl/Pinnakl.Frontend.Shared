// Angular
import { Injectable } from '@angular/core';

// Third party libs
import * as _ from 'lodash';
import * as moment from 'moment';

// Models
import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { Broker } from '../models/oms/broker/broker.model';
import { CurrencyForOMSFromApi } from '../models/oms/currency.model';
import { CurrencyForOMS } from '../models/oms/currency.model';
import { FxRateFromApi } from '../models/oms/fx-rate.model';
import { FxRate } from '../models/oms/fx-rate.model';
import { Holiday } from '../models/oms/holiday.model';
import { HolidayFromApi } from '../models/oms/holiday.model';
import { PSETFromAPI } from '../models/oms/pset.model';
import { PSET } from '../models/oms/pset.model';
import { SecFee } from '../models/oms/sec-fee.model';
import { SecFeeFromAPI } from '../models/oms/sec-fee.model';
import {
  TradeWorkflowSpecs,
  TradeWorkflowSpecsFromApi
} from '../models/oms/trade-workflow-specs.model';
import { TradingCurrencyFromApi } from '../models/oms/trading-currency.model';
import { TradingCurrency } from '../models/oms/trading-currency.model';
import { PBAccount } from '../models/pb-account.model';
import { AssetType } from '../models/security/asset-type.model';
import { SecurityType } from '../models/security/security-type.model';
import { Folder } from './../models/oms/folder.model';
import { Security } from './../models/security/security.model';

// Services
import { AuthenticationService, User, UserFromApi } from '@pnkl-frontend/core';
import { BrokerService } from '../pinnakl-web-services/broker.service';
import { SecurityService } from '../pinnakl-web-services/security/security.service';
import { TradeAllocationService } from '../pinnakl-web-services/trade-allocation.service';
import { Utility } from '../services/utility.service';
import { MarketService } from './security/market.service';

@Injectable()
export class OMSService {
  private readonly HOLIDAY_API_URL = 'holidays';
  private readonly CURRENCIES_API_URL = 'global_currencies';
  private readonly TRADING_CURRENCIES_API_URL = 'trading_currencies';
  private readonly PSET_API_URL = 'psets';
  private readonly ALLOCATION_TEMPLATE_API_URL = 'trade_allocation_templates';
  private readonly FOLDER_API = 'trade_folder';
  private readonly FX_RATE_API_URL = 'fxrates';
  private readonly SEC_FEE_API_URL = 'sec_fee';
  private readonly DTC_BIC = 'dtcyus33';
  private readonly TRADE_APPROVERS_API_URL = 'trade_request_approvers';
  private readonly TRADE_WORKFLOW_SPECS_API_URL = 'trade_workflow_specs';

  private _holidays: Holiday[];
  private _pSETs: PSET[];
  private _currencies: CurrencyForOMS[];
  private _tradingCurrencies: TradingCurrency[];
  private _assetTypes: AssetType[];
  private _securityTypes: SecurityType[];
  private _PBAccounts: PBAccount[];
  private _fxRates: FxRate[] = [];
  private _brokers: Broker[];
  private _securities: Security[];
  private _secFeeRates: SecFee[];
  private _tradeAprovers: User[];
  private _tradeWorkflowSpecs: TradeWorkflowSpecs;

  constructor(
    private wsp: WebServiceProvider,
    private securityService: SecurityService,
    private marketService: MarketService,
    private brokerService: BrokerService,
    private tradeAllocationService: TradeAllocationService,
    private utility: Utility,
    private authService: AuthenticationService
  ) {}

  public getHolidays(): Promise<Holiday[]> {
    if (this._holidays) {
      return Promise.resolve(this._holidays);
    }

    const fields = ['Id', 'holidaydate'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.HOLIDAY_API_URL,
      options: {
        fields: fields
      }
    };

    return this.wsp.get(getWebRequest).then((holidays: HolidayFromApi[]) => {
      this._holidays = holidays.map(holiday => this.formatHoliday(holiday));
      return this._holidays;
    });
  }

  private formatHoliday(holiday: HolidayFromApi): Holiday {
    const id = +holiday.id,
      holidayDateMoment = moment(holiday.holidaydate, 'MM/DD/YYYY');
    return {
      id: !isNaN(id) ? id : null,
      holidayDate: holidayDateMoment.isValid()
        ? holidayDateMoment.toDate()
        : null
    };
  }

  public getCurrencies(): Promise<CurrencyForOMS[]> {
    if (this._currencies) {
      return Promise.resolve(this._currencies);
    }

    const fields = ['Id', 'currency'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.CURRENCIES_API_URL,
      options: {
        fields: fields
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then((currencies: CurrencyForOMSFromApi[]) => {
        this._currencies = currencies.map(currency =>
          this.formatCurrency(currency)
        );
        return this._currencies;
      });
  }

  private formatCurrency(currency: CurrencyForOMSFromApi): CurrencyForOMS {
    const id = +currency.id,
      curr = currency.currency;
    return new CurrencyForOMS(!isNaN(id) ? id : null, curr);
  }

  public getTradingCurrencies(): Promise<TradingCurrency[]> {
    if (this._tradingCurrencies) {
      return Promise.resolve(this._tradingCurrencies);
    }

    const fields = ['id', 'g_id', 'currency'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.TRADING_CURRENCIES_API_URL,
      options: {
        fields: fields
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then((tradingCurrencies: TradingCurrencyFromApi[]) => {
        this._tradingCurrencies = tradingCurrencies.map(tradingCurrency =>
          this.formatTradingCurrency(tradingCurrency)
        );
        return this._tradingCurrencies;
      });
  }

  private formatTradingCurrency(
    currency: TradingCurrencyFromApi
  ): TradingCurrency {
    const id = +currency.id,
      g_id = +currency.g_id,
      curr = currency.currency;
    return {
      id: !isNaN(id) ? id : null,
      g_id: !isNaN(g_id) ? g_id : null,
      currency: curr
    };
  }

  public convertTradingCurrencyToCurrency(
    tradingCurrency: TradingCurrency
  ): CurrencyForOMS {
    return {
      id: tradingCurrency.g_id,
      currency: tradingCurrency.currency
    };
  }

  public getPSETs(): Promise<PSET[]> {
    if (this._pSETs) {
      return Promise.resolve(this._pSETs);
    }

    const fields = ['id', 'name', 'bic', 'currencyid', 'currency'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.PSET_API_URL,
      options: {
        fields: fields
      }
    };

    return this.wsp.get(getWebRequest).then((psets: PSETFromAPI[]) => {
      this._pSETs = psets.map(pset => this.formatPSETs(pset));
      return this._pSETs;
    });
  }

  private formatPSETs(pset: PSETFromAPI): PSET {
    const id = +pset.id,
      currId = +pset.currencyid;
    return {
      id: !isNaN(id) ? id : null,
      name: pset.name,
      bic: pset.bic,
      currencyId: !isNaN(currId) ? currId : null,
      currency: pset.currency
    };
  }

  public getAssetTypes(): Promise<AssetType[]> {
    if (this._assetTypes) {
      return Promise.resolve(this._assetTypes);
    }
    return this.securityService
      .getAssetTypes()
      .then((assetTypes: AssetType[]) => {
        this._assetTypes = assetTypes;
        return this._assetTypes;
      });
  }

  public getSecurityTypes(): Promise<SecurityType[]> {
    if (this._securityTypes) {
      return Promise.resolve(this._securityTypes);
    }
    return this.securityService
      .getSecurityTypes()
      .then((securityTypes: SecurityType[]) => {
        this._securityTypes = securityTypes;
        return this._securityTypes;
      });
  }

  public getAllSecurities(requestFromServer: boolean): Promise<Security[]> {
    if (this._securities && requestFromServer === false) {
      return Promise.resolve(this._securities);
    } else {
      return this.securityService
        .getAllSecurities()
        .then((securities: Security[]) => {
          this._securities = securities;
          return this._securities;
        });
    }
  }
  public getBrokers(): Promise<Broker[]> {
    if (this._brokers) {
      return Promise.resolve(this._brokers);
    }
    return this.loadBrokers();
  }

  public loadBrokers(): Promise<Broker[]> {
    return this.brokerService.getBrokers().then((brokers: Broker[]) => {
      this._brokers = brokers;
      return this._brokers;
    });
  }

  public getTradeApprovers(): Promise<User[]> {
    if (this._tradeAprovers) {
      return Promise.resolve(this._tradeAprovers);
    }

    const fields = ['clientid', 'userid', 'firstname', 'lastname'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.TRADE_APPROVERS_API_URL,
      options: {
        fields: fields
      }
    };

    return this.wsp.get(getWebRequest).then((users: UserFromApi[]) => {
      this._tradeAprovers = users.map(
        user =>
          new User(
            +user['clientid'],
            null,
            null,
            `${user['firstname']} ${user['lastname']}`,
            +user['userid'],
            null,
            null,
            null
          )
      );
      return this._tradeAprovers;
    });
  }

  public getTradeWorkflowSpecs(): Promise<TradeWorkflowSpecs> {
    if (this._tradeWorkflowSpecs) {
      return Promise.resolve(this._tradeWorkflowSpecs);
    }

    const fields = ['manualApproval', 'listedExecution', 'nonListedFills'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.TRADE_WORKFLOW_SPECS_API_URL,
      options: {
        fields: fields
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then((workflowSpecs: TradeWorkflowSpecsFromApi[]) => {
        this._tradeWorkflowSpecs = workflowSpecs.map(workflowSpec =>
          this.formatTradeWorkflowSpecs(workflowSpec)
        )[0];
        return this._tradeWorkflowSpecs;
      });
  }

  private formatTradeWorkflowSpecs(
    workflowSpec: TradeWorkflowSpecsFromApi
  ): TradeWorkflowSpecs {
    return new TradeWorkflowSpecs(
      workflowSpec.manualapproval === 'True' ? true : false,
      workflowSpec.listedexecution === 'True' ? true : false,
      workflowSpec.nonlistedfills === 'True' ? true : false
    );
  }

  public getPBAccounts(): Promise<PBAccount[]> {
    if (this._PBAccounts) {
      return Promise.resolve(this._PBAccounts);
    }
    return this.tradeAllocationService
      .getPBAccountsByAccountType()
      .then((pbAccounts: PBAccount[]) => {
        this._PBAccounts = pbAccounts;
        return this._PBAccounts;
      });
  }

  public LoadFxRates(date: Date): Promise<FxRate[]> {
    const rateDate = this.utility.addBusinessDays(date, -3, []);

    if (!_.find(this._fxRates, { priceDate: date })) {
      const fields = ['id', 'currencyid', 'pricedate', 'fxrate'];
      const getWebRequest: GetWebRequest = {
        endPoint: this.FX_RATE_API_URL,
        options: {
          fields: fields,
          filters: [
            {
              key: 'pricedate',
              type: 'GE',
              value: [moment(rateDate).format('MM/DD/YYYY')]
            }
          ]
        }
      };

      return this.wsp.get(getWebRequest).then((fxRates: FxRateFromApi[]) => {
        this._fxRates = fxRates.map(fxRate => this.formatFxRate(fxRate));
        return this._fxRates;
      });
    }
  }
  public getFxRate(date: Date, currency: CurrencyForOMS): Promise<FxRate> {
    let fxRate = this.getFxRateFromList(this._fxRates, date, currency);
    if (fxRate) {
      return Promise.resolve(fxRate);
    }

    const fields = ['id', 'currencyid', 'pricedate', 'fxrate'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.FX_RATE_API_URL,
      options: {
        fields: fields,
        filters: [
          {
            key: 'pricedate',
            type: 'EQ',
            value: [moment(date).format('MM/DD/YYYY')]
          }
        ]
      }
    };

    return this.wsp.get(getWebRequest).then((fxRates: FxRateFromApi[]) => {
      this._fxRates = this._fxRates.concat(
        fxRates.map(rt => this.formatFxRate(rt))
      );
      fxRate = this.getFxRateFromList(this._fxRates, date, currency);
      if (fxRate) {
        return Promise.resolve(fxRate);
      } else {
        Promise.resolve(1);
      }
    });
  }

  private getFxRateFromList(
    fxRates: FxRate[],
    date: Date,
    currency: CurrencyForOMS
  ): FxRate {
    date.setHours(0, 0, 0, 0);
    return _.filter(fxRates, {
      priceDate: date,
      currencyId: currency.id
    })[0];
  }

  private formatFxRate(fxRate: FxRateFromApi): FxRate {
    const id = +fxRate.id,
      currencyId = +fxRate.currencyid,
      priceDateMoment = moment(fxRate.pricedate, 'MM/DD/YYYY'),
      fxrate = parseFloat(fxRate.fxrate);

    return {
      id: !isNaN(id) ? id : null,
      currencyId: !isNaN(currencyId) ? currencyId : null,
      priceDate: priceDateMoment.isValid() ? priceDateMoment.toDate() : null,
      fxRate: fxrate
    };
  }

  public getSECFeeRates(): Promise<SecFee[]> {
    if (this._secFeeRates) {
      Promise.resolve(this._secFeeRates);
    }

    const fields = ['id', 'assetTypeId', 'fees', 'startdate', 'enddate'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.SEC_FEE_API_URL,
      options: {
        fields: fields
      }
    };

    return this.wsp.get(getWebRequest).then((secFeeRates: SecFeeFromAPI[]) => {
      this._secFeeRates = secFeeRates.map(secFeeRate =>
        this.formatSECFeeRate(secFeeRate)
      );
      return this._secFeeRates;
    });
  }

  private formatSECFeeRate(secfee: SecFeeFromAPI): SecFee {
    const id = +secfee.id,
      assetTypeId = +secfee.assettypeid,
      feesPerShare = parseFloat(secfee.fees);

    return {
      id: !isNaN(id) ? id : null,
      assetTypeId: !isNaN(assetTypeId) ? assetTypeId : null,
      feesPerShare: !isNaN(feesPerShare) ? feesPerShare : null,
      startDate: moment(secfee.startdate, 'MM/DD/YYYYY  hh:mm:ss a').toDate(),
      endDate: moment(secfee.enddate, 'MM/DD/YYYYY  hh:mm:ss a').toDate()
    };
  }

  public shouldHaveAccrued(pAssetType: string): boolean {
    if (['bond', 'muni'].indexOf(pAssetType) > -1) {
      return true;
    } else {
      // console.log('return false');
      return false;
    }
  }

  public shouldTradeHaveSECFee(
    tranType: string,
    pAssetType: string,
    pSectype: string,
    pset: PSET
  ): boolean {
    let validFeeTr = false;

    if (
      ['equity', 'option', 'pfd'].indexOf(pAssetType) > -1 ||
      ['etf', 'mf'].indexOf(pSectype) > -1
    ) {
      if (tranType) {
        if (tranType.substr(0, 1).toLowerCase() === 's') {
          if (pset && pset.bic === this.DTC_BIC) {
            validFeeTr = true;
          }
        }
      }
    }
    return validFeeTr;
  }

  public shouldTradeHaveOptionFee(pSectype: string, pset: PSET): boolean {
    let validFeeTr = false;

    if (['eqopt', 'futopt', 'indexopt'].indexOf(pSectype) > -1) {
      if (pset && pset.bic === this.DTC_BIC) {
        validFeeTr = true;
      }
    }
    return validFeeTr;
  }

  public getDefaultPSET(): PSET {
    if (this._pSETs !== undefined) {
      const ret = _.filter(this._pSETs, { bic: this.DTC_BIC })[0];
      return Object.assign({}, ret);
    } else {
      return null;
    }
  }

  public getBookCurrency(): CurrencyForOMS {
    if (this._tradingCurrencies !== undefined) {
      const ret = _.filter(this._tradingCurrencies, function (
        o: TradingCurrency
      ): boolean {
        return o.currency === 'USD';
      })[0];
      return this.convertTradingCurrencyToCurrency(ret);
    } else {
      return null;
    }
  }

  public IsTradeInBookCurrency(currency: CurrencyForOMS): boolean {
    let isTradeInBookCurr = false;

    if (currency) {
      const bookCurrency = this.getBookCurrency();
      if (bookCurrency.id === currency.id) {
        isTradeInBookCurr = true;
      }
    }
    return isTradeInBookCurr;
  }

  public isCounterpartyTrade(
    trsIndicator: boolean,
    assetType: string,
    privateIndicator: boolean
  ): boolean {
    assetType = assetType !== undefined ? assetType.toLowerCase() : undefined;
    if (
      trsIndicator === true ||
      assetType === 'cds' ||
      assetType === 'bankdebt' ||
      privateIndicator === true
    ) {
      return true;
    } else {
      return false;
    }
  }

  public getAccountType(
    trsIndicator: boolean,
    assetType: string,
    privateIndicator: boolean
  ): string {
    let accountType = null;
    if (
      trsIndicator === undefined &&
      assetType === undefined &&
      privateIndicator === undefined
    ) {
      return 'pb';
    }

    if (trsIndicator === true) {
      accountType = 'trs';
    } else {
      if (
        assetType.toLowerCase() === 'cds' ||
        assetType.toLowerCase() === 'bankdebt'
      ) {
        accountType = assetType.toLowerCase() === 'cds' ? 'isda' : 'bd';
      } else {
        accountType = privateIndicator === true ? 'otc' : 'pb';
      }
    }
    return accountType;
  }

  public calcSettleDate(
    pTradeDate: Date,
    pAssetTypeId: number,
    securityType: string,
    holidayCalendar: Holiday[]
  ): Date {
    let numDays = 0;
    if (pTradeDate !== undefined && pAssetTypeId !== undefined) {
      const found = _.filter(this._assetTypes, function (
        o: AssetType
      ): boolean {
        return o.id === pAssetTypeId;
      });

      if (found.length > 1) {
        alert('Incorrect Settlement Instructions !');
      }
      if (found.length === 1) {
        numDays = found[0].daysforsettlement;

        if (securityType) {
          if (securityType.toLowerCase() === 'govt') {
            numDays = 1;
          }
        }
        const new_date = this.utility.addBusinessDays(
          pTradeDate,
          numDays,
          holidayCalendar
        );
        return new_date;
      } else {
        return null;
      }
    }
  }

  public getPaymentCurrency(
    security: Security,
    tranType: string
  ): Promise<number> {
    if (security.assetType.toLowerCase() !== 'crncy') {
      return Promise.resolve(security.currencyId);
    } else {
      if (tranType) {
        // If the transaction type is a sell or a sell short, then the primary currency is the payment currency
        if (tranType.substring(0, 1).toLowerCase() === 's') {
          return Promise.resolve(security.currencyId);
        } else {
          // Secondary currency is payment currency
          const fields = ['secondaryCurrencyId'];
          const getWebRequest: GetWebRequest = {
            endPoint: 'currencies',
            options: {
              fields: fields,
              filters: [
                {
                  key: 'securityid',
                  type: 'EQ',
                  value: [security.id.toString()]
                }
              ]
            }
          };

          return this.wsp.get(getWebRequest).then(result => {
            return +result[0].secondarycurrencyid;
          });
        }
      }
    }
  }

  public getCounterparties(
    trsIndicator: boolean,
    assetType: string,
    privateIndicator: boolean
  ): PBAccount[] {
    // Filter and get only the relevant account Types.
    const accountType = this.getAccountType(
      trsIndicator,
      assetType,
      privateIndicator
    );
    const pbAccounts = _.filter(this._PBAccounts, function (o) {
      return o.accountType.toLowerCase() === accountType;
    });

    // Get only the custodianid,custodianname fields so that a unique function can be applied.
    const pbAccountsMap = _.map(pbAccounts, function (object) {
      return _.pick(object, ['custodianId', 'custodianName']);
    });

    // apply unique function.
    let counterparties = _.uniqWith(pbAccountsMap, _.isEqual);
    counterparties = _.sortBy(counterparties, 'custodianName');
    return counterparties;
  }

  public getFolders(): Promise<Folder> {
    const fields = ['id', 'col1'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.FOLDER_API,
      options: {
        fields: fields
      }
    };
    return this.wsp.get(getWebRequest);
  }

  public calcPrincipal(
    quant: number,
    price: number,
    multiplier: number,
    principalFactor: number
  ): number {
    let principal = 0;
    if (quant && multiplier) {
      principal = quant * price * multiplier * principalFactor;
    }
    return principal;
  }

  public calcSECFee(principal: number, secFeeRate: number): number {
    let fee = 0;
    if (principal && secFeeRate) {
      fee = principal * secFeeRate;
      fee = Math.ceil(fee * 100) / 100;
    }
    return fee;
  }

  public calcOptionFee(quant: number, optionFeeRate: number): number {
    let fee = 0;
    if (quant && optionFeeRate) {
      fee = quant * optionFeeRate;
      fee = Math.ceil(fee * 100) / 100;
    }
    return fee;
  }

  public calcComission(quant: number, commissionPerShare: number): number {
    let commission = 0;
    if (quant && commissionPerShare) {
      commission = quant * commissionPerShare;
    }
    return commission;
  }

  public calcAccrued(
    quant: number,
    accrualPerUnit: number,
    principalFactor: number
  ): number {
    let accrued = null;
    if (quant && accrualPerUnit) {
      accrued = quant * principalFactor * accrualPerUnit;
    }
    return accrued;
  }

  public calcNetLocal(
    tranType: string,
    principal: number,
    secFee: number,
    optionFee: number,
    accrued: number,
    commission: number
  ): number {
    let netLocal = 0;

    if (tranType && principal) {
      const sign = tranType.substring(0, 1).toLowerCase() === 'b' ? 1 : -1;
      secFee = secFee ? secFee : 0;
      optionFee = optionFee ? optionFee : 0;
      accrued = accrued ? accrued : 0;
      commission = commission ? commission : 0;
      netLocal = principal + accrued + sign * (secFee + commission + optionFee);
    }
    return netLocal;
  }

  public calcNetUSD(netLocal: number, fxRate: number): number {
    return netLocal * fxRate;
  }

  public shouldTradeHaveAccrued(pAssetType: string): boolean {
    return ['bond', 'muni'].indexOf(pAssetType) > -1 ? true : false;
  }

  public getActiveSecurityMarketId(securityId: number): Promise<number> {
    return this.marketService
      .getSecurityMarkets(securityId)
      .then(secMarkets => {
        const secMarketId: number = _.find(secMarkets, {
          activeTradingIndicator: true
        }).id;
        return secMarketId;
      });
  }
}
