// Angular
import { Injectable } from '@angular/core';

// Third party libs
import * as _ from 'lodash';
import * as moment from 'moment';

// Models
import { WebServiceProvider } from '@pnkl-frontend/core';
import { Account } from '../models/account.model';
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
import { AUM } from './../models/aum.model';
import { Folder } from './../models/oms/folder.model';
import { Security } from './../models/security/security.model';

// Services
import { User, UserFromApi } from '@pnkl-frontend/core';
import { BrokerService } from '../pinnakl-web-services/broker.service';
import { SecurityService } from '../pinnakl-web-services/security/security.service';
import { TradeAllocationService } from '../pinnakl-web-services/trade-allocation.service';
import { Utility } from '../services/utility.service';
import { AccountService } from './account.service';
import { AccountingService } from './accounting.service';
import { MarketService } from './security/market.service';

@Injectable()
export class OMSService {
  private readonly _omsEndpoint = 'entities/oms';
  private readonly _holidaysEndpoint = 'entities/holidays';
  private readonly _globalCurrenciesEndpoint = 'entities/global_currencies';
  private readonly _tradingCurrenciesEndpoint = 'entities/trading_currencies';
  private readonly _psetsEndpoint = 'entities/psets';
  private readonly _tradeFolderEndpoint = 'entities/trade_folder';
  private readonly _fxRatesEndpoint = 'entities/fxrates';
  private readonly _secFeeEndpoint = 'entities/sec_fee';
  private readonly _tradeRequestApproversEndpoint =
    'entities/trade_request_approvers';
  private readonly _tradeWorkflowSpecsEndpoint =
    'entities/trade_workflow_specs';
  private readonly DTC_BIC = 'dtcyus33';

  private _accounts: Account[];
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
  private _aum: AUM[] = [];

  constructor(
    private readonly wsp: WebServiceProvider,
    private readonly securityService: SecurityService,
    private readonly marketService: MarketService,
    private readonly brokerService: BrokerService,
    private readonly accountService: AccountService,
    private readonly accountingService: AccountingService,
    private readonly tradeAllocationService: TradeAllocationService,
    private readonly utility: Utility
  ) { }

  public async getOMSData(): Promise<any> {
    const result = await this.wsp.getHttp<any[]>({
      endpoint: this._omsEndpoint
    });

    this._accounts = result
      .filter(item => item['pnkl_type'] === 'accounts')
      .map(this.accountService.formatAccount);
    const trade_params = result.filter(
      item => item['pnkl_type'] === 'omstrade_params'
    );
    const trade_columns = result.filter(
      item => item['pnkl_type'] === 'omstrade_columns'
    );

    this._pSETs = result
      .filter(item => item['pnkl_type'] === 'psets')
      .map(pset => this.formatPSETs(pset));
    this._tradingCurrencies = result
      .filter(item => item['pnkl_type'] === 'trading_currencies')
      .map(pset => this.formatTradingCurrency(pset));
    this._brokers = result
      .filter(item => item['pnkl_type'] === 'brokers')
      .map(broker => this.brokerService.formatBroker(broker));
    this._tradeWorkflowSpecs = result
      .filter(item => item['pnkl_type'] === 'trade_workflow_specs')
      .map(spec => this.formatTradeWorkflowSpecs(spec))[0];

    // this._aum.push(new AUM(0, 17, 148239359.03, new Date()));
    // this._aum.push(new AUM(0, 18, 49572206.53, new Date()));
    this._aum = result
      .filter(item => item['pnkl_type'] === 'aum')
      .map(aum => this.accountingService.formatAUM(aum));

    this.securityService.formatAndSetAssetTypes(
      result.filter(item => item['pnkl_type'] === 'asset_types')
    );

    this._secFeeRates = result
      .filter(item => item['pnkl_type'] === 'sec_fee')
      .map(assetType => this.formatSECFeeRate(assetType));

    this._PBAccounts = result
      .filter(item => item['pnkl_type'] === 'pbaccounts')
      .map(acct => this.tradeAllocationService.formatPbAccount(acct));

    this._holidays = result
      .filter(item => item['pnkl_type'] === 'holidays')
      .map(holiday => this.formatHoliday(holiday));

    this._securities = this.securityService.formatAndSetSecurities(
      result.filter(item => item['pnkl_type'] === 'securities')
    );

    this._fxRates = result
      .filter(item => item['pnkl_type'] === 'fxrates')
      .map(fxRate => this.formatFxRate(fxRate));

    return [
      trade_params,
      trade_columns,
      this._tradeWorkflowSpecs,
      this._accounts
    ];
  }

  public async getHolidays(): Promise<Holiday[]> {
    if (this._holidays) {
      return Promise.resolve(this._holidays);
    }

    const holidays = await this.wsp.getHttp<HolidayFromApi[]>({
      endpoint: this._holidaysEndpoint,
      params: {
        fields: ['Id', 'holidaydate']
      }
    });

    this._holidays = holidays.map(holiday => this.formatHoliday(holiday));
    return this._holidays;
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

    return this.wsp
      .getHttp<CurrencyForOMSFromApi[]>({
        endpoint: this._globalCurrenciesEndpoint,
        params: {
          fields: ['Id', 'currency']
        }
      })
      .then(currencies => {
        this._currencies = currencies.map(this.formatCurrency);
        return this._currencies;
      });
  }

  public formatCurrency(currency: CurrencyForOMSFromApi): CurrencyForOMS {
    const id = +currency.id;
    return new CurrencyForOMS(!isNaN(id) ? id : null, currency.currency);
  }

  public getTradingCurrencies(): Promise<TradingCurrency[]> {
    if (this._tradingCurrencies) {
      return Promise.resolve(this._tradingCurrencies);
    }

    return this.wsp
      .getHttp<TradingCurrencyFromApi[]>({
        endpoint: this._tradingCurrenciesEndpoint,
        params: {
          fields: ['id', 'g_id', 'currency']
        }
      })
      .then(tradingCurrencies => {
        this._tradingCurrencies = tradingCurrencies.map(
          this.formatTradingCurrency
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

    return this.wsp
      .getHttp<PSETFromAPI[]>({
        endpoint: this._psetsEndpoint,
        params: {
          fields: ['id', 'name', 'bic', 'currencyid', 'currency']
        }
      })
      .then(psets => {
        this._pSETs = psets.map(this.formatPSETs);
        return this._pSETs;
      });
  }

  public getAUMs(): Promise<AUM[]> {
    return Promise.resolve(this._aum);
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

  public async getSecuritiesIfMissing(newSecIds: number[]): Promise<boolean> {
    const existingSecIds = this._securities.map(p => p.id);
    const secIdsToFetch = _.difference(newSecIds, existingSecIds);

    if (secIdsToFetch.length > 0) {
      console.log('Missing seurities found: ', secIdsToFetch);
      await this.securityService.getAllTradingSecurities().then(result => {
        const newSecurities = result.filter(
          sec => existingSecIds.includes(sec.id) === false
        );
        this._securities = this._securities.concat(newSecurities);
        console.log('Missing securities added ', newSecurities);
        return Promise.resolve(true);
      });
    } else {
      return Promise.resolve(true);
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

  public async getTradeApprovers(): Promise<User[]> {
    if (this._tradeAprovers) {
      return Promise.resolve(this._tradeAprovers);
    }

    const fields = ['clientid', 'userid', 'firstname', 'lastname'];
    const tradeApprovers = await this.wsp.getHttp<UserFromApi[]>({
      endpoint: this._tradeRequestApproversEndpoint,
      params: {
        fields: fields
      }
    });

    this._tradeAprovers = tradeApprovers.map(
      user =>
        new User(
          +user['clientid'],
          null,
          null,
          `${user['firstname']} ${user['lastname']}`,
          +user['userid'],
          null,
          null,
          null,
          null,
          null,
          null,
          null
        )
    );
    return this._tradeAprovers;
  }

  public async getTradeWorkflowSpecs(): Promise<TradeWorkflowSpecs> {
    if (this._tradeWorkflowSpecs) {
      return Promise.resolve(this._tradeWorkflowSpecs);
    }

    const fields = [
      'manualApproval',
      'listedExecution',
      'locatesIntegration',
      'nonListedFills',
      'minIncrement',
      'quantityAsPct'
    ];

    const specs = await this.wsp.getHttp<TradeWorkflowSpecsFromApi[]>({
      endpoint: this._tradeWorkflowSpecsEndpoint,
      params: {
        fields: fields
      }
    });

    this._tradeWorkflowSpecs = this.formatTradeWorkflowSpecs(specs[0]);
    return this._tradeWorkflowSpecs;
  }

  public async putTradeWorkflowSpecs(
    data: Partial<TradeWorkflowSpecs>
  ): Promise<any> {
    const result = await this.wsp.putHttp<TradeWorkflowSpecsFromApi>({
      endpoint: this._tradeWorkflowSpecsEndpoint,
      body: data
    });

    this._tradeWorkflowSpecs = this.formatTradeWorkflowSpecs(result);
    return this._tradeWorkflowSpecs;
  }

  public formatTradeWorkflowSpecs(
    workflowSpec: TradeWorkflowSpecsFromApi
  ): TradeWorkflowSpecs {
    return new TradeWorkflowSpecs(
      workflowSpec.id,
      workflowSpec.manualapproval === 'True',
      workflowSpec.listedexecution === 'True',
      workflowSpec.nonlistedfills === 'True',
      workflowSpec.locatesintegration === 'True',
      workflowSpec.minincrement === 'True',
      +workflowSpec.quantityaspct,
      workflowSpec.onlyviewtodayactivity === 'True',
      workflowSpec.defaultallocationaccts
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

    if (
      !_.find(this._fxRates, { priceDate: date }) &&
      date.toDateString !== new Date().toDateString
    ) {
      return this.wsp
        .getHttp<FxRateFromApi[]>({
          endpoint: this._fxRatesEndpoint,
          params: {
            fields: ['id', 'currencyid', 'pricedate', 'fxrate'],
            filters: [
              {
                key: 'pricedate',
                type: 'GE',
                value: [moment(rateDate).format('MM/DD/YYYY')]
              }
            ]
          }
        })
        .then(fxRates => {
          this._fxRates = fxRates.map(this.formatFxRate);
          return this._fxRates;
        });
    }
  }

  public getFxRate(date: Date, currency: CurrencyForOMS): Promise<FxRate> {
    const fxRate = this.getFxRateFromList(this._fxRates, date, currency);
    if (fxRate) {
      return Promise.resolve(fxRate);
    }

    return this.wsp
      .getHttp<FxRateFromApi[]>({
        endpoint: this._fxRatesEndpoint,
        params: {
          fields: ['id', 'currencyid', 'pricedate', 'fxrate'],
          filters: [
            {
              key: 'pricedate',
              type: 'EQ',
              value: [moment(date).format('MM/DD/YYYY')]
            }
          ]
        }
      })
      .then(fxRates => {
        this._fxRates = this._fxRates.concat(fxRates.map(this.formatFxRate));
        return Promise.resolve(
          this.getFxRateFromList(this._fxRates, date, currency)
        );
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

  public async getSECFeeRates(): Promise<SecFee[]> {
    if (this._secFeeRates) {
      return Promise.resolve(this._secFeeRates);
    }

    const fields = ['id', 'assetTypeId', 'fees', 'startdate', 'enddate'];
    this._secFeeRates = await this.wsp
      .getHttp<SecFeeFromAPI[]>({
        endpoint: this._secFeeEndpoint,
        params: {
          fields: fields
        }
      })
      .then(rates => rates.map(this.formatSECFeeRate));
    return this._secFeeRates;
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
      ['equity', 'pfd'].indexOf(pAssetType) > -1 ||
      ['eqopt', 'futopt'].indexOf(pSectype) > -1 ||
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
      const ret = _.filter(
        this._tradingCurrencies,
        function (o: TradingCurrency): boolean {
          return o.currency === 'USD';
        }
      )[0];
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
    assetType: string,
    privateIndicator: boolean
  ): boolean {
    assetType = assetType !== undefined ? assetType.toLowerCase() : undefined;
    if (
      assetType === 'trs' ||
      assetType === 'cds' ||
      assetType === 'bankdebt' ||
      privateIndicator === true
    ) {
      return true;
    } else {
      return false;
    }
  }

  public getAccountType(assetType: string, privateIndicator: boolean): string {
    let accountType = null;
    if (assetType === undefined && privateIndicator === undefined) {
      return 'pb';
    }

    if (assetType.toLowerCase() === 'trs') {
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
      const found = _.filter(
        this._assetTypes,
        function (o: AssetType): boolean {
          return o.id === pAssetTypeId;
        }
      );

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

  public async getPaymentCurrency(
    security: Security,
    tranType: string
  ): Promise<number> {
    if (security.assetType.toLowerCase() !== 'crncy') {
      return Promise.resolve(security.currencyId);
    } else {
      if (tranType) {
        // If the transaction type is a sell or a sell short, then the primary currency is the payment currency
        if (tranType.substring(0, 1).toLowerCase() === 's') {
          return security.currencyId;
        } else {
          // Secondary currency is payment currency
          const result = await this.wsp.getHttp<any[]>({
            endpoint: 'entities/currencies',
            params: {
              fields: ['secondaryCurrencyId'],
              filters: [
                {
                  key: 'securityid',
                  type: 'EQ',
                  value: [security.id.toString()]
                }
              ]
            }
          });

          return +result[0].secondarycurrencyid;
        }
      }
    }
  }

  public getCounterparties(
    assetType: string,
    privateIndicator: boolean
  ): PBAccount[] {
    // Filter and get only the relevant account Types.
    const accountType = this.getAccountType(assetType, privateIndicator);
    const pbAccounts = _.filter(
      this._PBAccounts,
      o => o.accountType.toLowerCase() === accountType
    );

    // Get only the custodianid,custodianname fields so that a unique function can be applied.
    const pbAccountsMap = _.map(pbAccounts, o =>
      _.pick(o, ['custodianId', 'custodianName'])
    );

    // apply unique function.
    let counterparties = _.uniqWith(pbAccountsMap, _.isEqual);
    counterparties = _.sortBy(counterparties, 'custodianName');
    return counterparties;
  }

  public getFolders(): Promise<Folder> {
    const fields = ['id', 'col1'];
    return this.wsp.getHttp<any>({
      endpoint: this._tradeFolderEndpoint,
      params: {
        fields: fields
      }
    });
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
