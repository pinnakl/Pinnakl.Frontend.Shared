// Angular
import { Injectable } from '@angular/core';
import { TradeAuthorization, TradeAuthorizationFromAPI } from '../models/oms';

// Third party libs
import * as _ from 'lodash';
import * as moment from 'moment';

// Models
import {
  WebServiceProvider,
  WebSocketMessageFilter
} from '@pnkl-frontend/core';

import { PSET } from '../models/oms';
import { TradeRequestLog } from '../models/oms';
import { TradeRequestFromApi } from '../models/oms';
import { TradeRequest } from '../models/oms';
import { TradingCurrency } from '../models/oms';
import { CurrencyForOMS } from '../models/oms';
import { TradeExecutionReporting } from '../models/oms';
import { Broker } from '../models/oms/broker';
import { Security } from '../models/security';

// Services
import {
  TradeRequestAllocation,
  TradeRequestAllocationFromAPI
} from '../models/oms';
import { OMSService } from './oms.service';
import { TradeAllocationService } from './trade-allocation.service';

@Injectable()
export class TradeService {
  private readonly _tradeRequestsEndpoint = 'entities/trade_requests';
  private readonly _tradeRequestsLogEndpoint = 'entities/trade_requests_log';
  private readonly _tradeAuthorizationsEndpoint =
    'entities/trade_authorizations';
  private readonly _tradeRequestAllocationsEndpoint =
    'entities/trade_request_allocations';
  private readonly _tradeExecutionReportingEndpoint =
    'entities/trade_execution_reporting';

  private readonly _tradeRequestsFields = [
    'tradeid',
    'securityId',
    'securityMarketId',
    'tranType',
    'tradeDate',
    'settleDate',
    'assetType',
    'ticker',
    'cusip',
    'identifier',
    'description',
    'quantity',
    'price',
    'currency',
    'fxrate',
    'commissionType',
    'commission',
    'secfee',
    'optionfee',
    'accruedInterest',
    'netMoneyLocal',
    'brokerId',
    'brokerName',
    'allocationsIndicator',
    'allocationId',
    'allocationStatus',
    'psetid',
    'customattribId',
    'counterpartyId',
    'comments',
    'approverMessage'
  ];
  private readonly _allocationImpactingFields = [
    'tranType',
    'tradedate',
    'quantity',
    'counterpartyId',
    'allocationId'
  ];

  constructor(
    private readonly wsp: WebServiceProvider,
    private readonly omsService: OMSService,
    private readonly tradeAllocationService: TradeAllocationService
  ) { }

  public async getMostRecentTradeRequests({
    from,
    to,
    onlyViewTodayActivity,
    date,
    requestFromServer
  }: {
    from: number;
    to: number;
    onlyViewTodayActivity: boolean;
    date: Date;
    requestFromServer: boolean;
  }): Promise<TradeRequest[]> {
    let wsFilter: WebSocketMessageFilter;
    if (onlyViewTodayActivity === false) {
      wsFilter = {
        key: '',
        type: 'RANGE',
        value: [from.toString(), to.toString()]
      };
    } else {
      wsFilter = {
        key: 'tradeDate',
        type: 'GE',
        value: [moment(new Date()).format('MM/DD/YYYY')]
      };
    }

    const [tradeRequests, dependencies] = await Promise.all([
      this.wsp.getHttp<TradeRequestFromApi[]>({
        endpoint: this._tradeRequestsEndpoint,
        params: {
          fields: this._tradeRequestsFields,
          filters: [wsFilter],
          orderBy: [
            {
              field: 'tradedate',
              direction: 'DESC'
            }
          ]
        }
      }),
      this.getTradeRequestSetterDependencies(date, requestFromServer)
    ]);

    return tradeRequests.map(tradeRequest =>
      this.formatTradeRequest(tradeRequest, dependencies)
    );
  }

  public async getTradeRequest(tradeId: number): Promise<TradeRequest> {
    const tradeRequest = await this.wsp.getHttp<TradeRequestFromApi>({
      endpoint: this._tradeRequestsEndpoint,
      params: {
        id: tradeId.toString()
      }
    });

    const tradeDate = moment(
      tradeRequest.tradedate,
      'MM/DD/YYYY hh:mm:ss A'
    ).toDate();

    // Make sure security is not missing
    await this.omsService.getSecuritiesIfMissing([
      parseInt(tradeRequest.securityid)
    ]);

    // Set dependencies
    const dependencies = await this.getTradeRequestSetterDependencies(
      tradeDate,
      false
    );
    return this.formatTradeRequest(tradeRequest, dependencies);
  }

  async tradesExistForSecurityMarketId(
    securityMarketIds: number[]
  ): Promise<number[]> {
    const tradeRequests = await this.wsp.getHttp<any[]>({
      endpoint: this._tradeRequestsEndpoint,
      params: {
        fields: ['securityMarketId'],
        filters: [
          {
            key: 'securityMarketId',
            type: 'IN',
            value: securityMarketIds.map(id => id.toString())
          }
        ]
      }
    });
    return _(tradeRequests)
      .map(({ securitymarketid }) => +securitymarketid)
      .uniq()
      .value();
  }

  public async getTradeRequestLogs(
    tradeId: number
  ): Promise<TradeRequestLog[]> {
    if (tradeId) {
      const fields = [
        'Id',
        'action',
        'UserId',
        'tranType',
        'tradeDate',
        'settleDate',
        'assetType',
        'quantity',
        'price',
        'CurrencyId',
        'commission',
        'secfee',
        'accruedInterest',
        'FxRate',
        'netMoneyLocal',
        'NetMoneyBook',
        'FirstName',
        'LastName',
        'brokerId',
        'brokerName',
        'asof'
      ];

      const entities = await this.wsp.getHttp<any[]>({
        endpoint: this._tradeRequestsLogEndpoint,
        params: {
          fields,
          filters: [{ key: 'tradeId', type: 'EQ', value: [tradeId.toString()] }]
        }
      });

      return entities.map(this.formatTradeRequestLog);
    }
    return [];
  }

  public async saveTradeRequest(tradeReq: TradeRequest): Promise<any> {
    return this.wsp.postHttp({
      endpoint: this._tradeRequestsEndpoint,
      body: this.getTradePostJSON(tradeReq)
    });
  }

  public async updateTradeRequest(
    oldTradeReq: TradeRequest,
    newTradeReq: TradeRequest,
    deleteChildAllocationsFlag: boolean
  ): Promise<any> {
    const updatedTradeJSON = this.getTradePutJSON(oldTradeReq, newTradeReq);

    await this.handleChildAllocationDeletion(
      updatedTradeJSON,
      deleteChildAllocationsFlag,
      newTradeReq.id
    );

    if (Object.keys(updatedTradeJSON).length > 1) {
      return this.wsp.putHttp({
        endpoint: this._tradeRequestsEndpoint,
        body: updatedTradeJSON
      });
    } else {
      if (
        Object.keys(updatedTradeJSON).length === 0 ||
        (Object.keys(updatedTradeJSON).length === 1 &&
          Object.keys(updatedTradeJSON)[0].toLowerCase() === 'id')
      ) {
        return newTradeReq;
      }
    }
  }

  public async deleteTradeRequest(tradeId: number): Promise<any> {
    return this.wsp.deleteHttp({
      endpoint: `${this._tradeRequestsEndpoint}/${tradeId}`
    });
  }

  public async getTradeRequestSetterDependencies(
    date: Date,
    requestFromServer: boolean = false
  ): Promise<any> {
    return Promise.all([
      this.omsService.getPSETs(),
      this.omsService.getTradingCurrencies(),
      this.omsService.getBrokers(),
      this.omsService.getAssetTypes(),
      this.omsService.getSECFeeRates(),
      this.omsService.LoadFxRates(date),
      this.omsService.getAllSecurities(false),
      this.omsService.getPBAccounts(),
      this.omsService.getHolidays()
    ]);
  }

  public async getTradeApprover(tReqId: number): Promise<any> {
    const entities = await this.wsp.getHttp<TradeAuthorizationFromAPI[]>({
      endpoint: this._tradeAuthorizationsEndpoint,
      params: {
        fields: ['id', 'traderequestid', 'userid', 'asOf'],
        filters: [
          {
            key: 'traderequestid',
            type: 'EQ',
            value: [tReqId.toString()]
          }
        ]
      }
    });

    return entities.map(this.formatTradeAuthorization);
  }

  public async getTradeRequestAllocations(
    tReqId: number
  ): Promise<TradeRequestAllocation[]> {
    const entities = await this.wsp.getHttp<TradeRequestAllocationFromAPI[]>({
      endpoint: this._tradeRequestAllocationsEndpoint,
      params: {
        fields: ['id', 'traderequestid', 'accountId', 'quantity'],
        filters: [
          {
            key: 'traderequestid',
            type: 'EQ',
            value: [tReqId.toString()]
          }
        ]
      }
    });

    return entities.map(this.formatTradeRequestAllocations);
  }

  public async getTradeExecutionReporting(
    tradeRequestId: number
  ): Promise<TradeExecutionReporting> {
    const tradeExecutionReporting = await this.wsp.getHttp({
      endpoint: this._tradeExecutionReportingEndpoint,
      params: {
        fields: ['Id', 'SendToBroker', 'SendToCustodian', 'SendToAdmin'],
        filters: [
          {
            key: 'TradeId',
            type: 'EQ',
            value: [tradeRequestId.toString()]
          }
        ]
      }
    });

    return {
      id: +tradeExecutionReporting[0]['id'],
      sendToAdmin: tradeExecutionReporting[0]['sendtoadmin'] === 'True',
      sendToBroker: tradeExecutionReporting[0]['sendtobroker'] === 'True',
      sendToCustodian: tradeExecutionReporting[0]['sendtocustodian'] === 'True'
    };
  }

  public async putTradeExecutionReporting(
    tradeExec: TradeExecutionReporting
  ): Promise<any> {
    return this.wsp.putHttp({
      endpoint: this._tradeExecutionReportingEndpoint,
      body: {
        id: tradeExec.id.toString(),
        sendToBroker: tradeExec.sendToBroker === true ? '1' : '0',
        sendToAdmin: tradeExec.sendToAdmin === true ? '1' : '0',
        sendToCustodian: tradeExec.sendToCustodian === true ? '1' : '0'
      }
    });
  }

  private async handleChildAllocationDeletion(
    updatedTradeJSON: any,
    tradeRequestAllocationsChanged: boolean,
    tradeRequestId: number
  ): Promise<any> {
    if (
      _.intersection(
        this._allocationImpactingFields,
        Object.keys(updatedTradeJSON)
      ).length > 0 ||
      tradeRequestAllocationsChanged
    ) {
      return this.tradeAllocationService.deleteAllocationsFromTradeRequestId(
        tradeRequestId
      );
    } else {
      return null;
    }
  }

  async postTradesRequestAllocation(
    tradesRequestAllocation: TradeRequestAllocation[]
  ): Promise<any> {
    return this.wsp.postHttp({
      endpoint: this._tradeRequestAllocationsEndpoint,
      body: [
        ...tradesRequestAllocation.map(tra => ({
          payload: {
            TradeRequestId: tra.tradeRequestId.toString(),
            AccountId: tra.accountId.toString(),
            Quantity: tra.quantity.toString()
          }
        }))
      ]
    });
  }

  async saveTradeRequestAllocations(
    saveAllocationsArray: TradeRequestAllocation[]
  ): Promise<TradeRequestAllocation[]> {
    let allocs = await this.postTradesRequestAllocation(saveAllocationsArray);
    if (allocs) {
      // If the response is single object
      if (!Array.isArray(allocs)) {
        if (allocs.fields) {
          allocs = [allocs];
        } else {
          allocs = [{ fields: allocs }];
        }
      }
      return allocs.map(
        alloc =>
          new TradeRequestAllocation(
            parseFloat(alloc.fields.id),
            parseFloat(alloc.fields.traderequestid),
            parseFloat(alloc.fields.accountid),
            parseFloat(alloc.fields.quantity)
          )
      );
    }
  }

  async deleteTradeRequestAllocation(id: number): Promise<any> {
    return this.wsp.deleteHttp({
      endpoint: `${this._tradeRequestAllocationsEndpoint}/${id}`
    });
  }

  async deleteTradeRequestAllocations(
    deleteAllocationsArray: TradeRequestAllocation[]
  ): Promise<TradeRequestAllocation[]> {
    const deletedTradeAllocations: TradeRequestAllocation[] = [];

    for await (const allocatedTrade of deleteAllocationsArray.map<Promise<any>>(
      alloc => this.deleteTradeRequestAllocation(alloc.id)
    )) {
      deletedTradeAllocations.push(allocatedTrade);
    }

    return deletedTradeAllocations;
  }

  public formatTradeRequestAllocations(
    tradeRequestAllocation: TradeRequestAllocationFromAPI
  ): TradeRequestAllocation {
    const id = +tradeRequestAllocation.id,
      tradeRequestId = +tradeRequestAllocation.traderequestid,
      accountId = +tradeRequestAllocation.accountid,
      quantity = parseFloat(tradeRequestAllocation.quantity);

    return new TradeRequestAllocation(
      id,
      tradeRequestId,
      accountId,
      isNaN(quantity) ? 0 : quantity
    );
  }

  public formatTradeRequest(
    tradeReqFromApi: TradeRequestFromApi,
    tradeRequestDependencies: any
  ): TradeRequest {
    let psets: PSET[];
    let currencies: CurrencyForOMS[];
    let tradingCurrencies: TradingCurrency[];
    let brokers: Broker[];
    let fees: any;
    let fx: any;
    let securities: Security[];
    let assetTypes: any;

    [
      psets,
      tradingCurrencies,
      brokers,
      assetTypes,
      fees,
      fx,
      securities
    ] = tradeRequestDependencies;
    currencies = tradingCurrencies.map(o =>
      this.omsService.convertTradingCurrencyToCurrency(o)
    );

    // -------------------------------------------------------------------------------
    // construct the settlement property
    // -------------------------------------------------------------------------------
    const tradeDate = moment(
      tradeReqFromApi.tradedate,
      'MM/DD/YYYY hh:mm:ss A'
    ).toDate();
    const settleDate = moment(
      tradeReqFromApi.settledate,
      'MM/DD/YYYY hh:mm:ss A'
    ).toDate();
    const pset = _.filter(psets, { id: +tradeReqFromApi.psetid })[0];

    // -------------------------------------------------------------------------------
    // construct the money property
    // -------------------------------------------------------------------------------
    const quantity = parseFloat(tradeReqFromApi.quantity);
    const price = parseFloat(tradeReqFromApi.price);

    let commissionPerShare = +tradeReqFromApi.commission;
    const commissionType = tradeReqFromApi.commissiontype;
    if (commissionType === 'gross') {
      commissionPerShare = commissionPerShare / quantity;
    }
    const secFee = parseFloat(tradeReqFromApi.secfee);
    const optionFee = parseFloat(tradeReqFromApi.optionfee);
    const accrued = parseFloat(tradeReqFromApi.accruedinterest);
    const fxRate = parseFloat(tradeReqFromApi.fxrate);
    const netMoneyLocal = parseFloat(tradeReqFromApi.netmoneylocal);
    const netMoneyBook = netMoneyLocal * fxRate;
    const currency = _.filter(currencies, {
      currency: tradeReqFromApi.currency
    })[0];

    const id = +tradeReqFromApi.tradeid;
    const tranType = tradeReqFromApi.trantype.toLowerCase();
    const securityMarketId = +tradeReqFromApi.securitymarketid;
    const comments = tradeReqFromApi.comments;
    const allocationsIndicator =
      tradeReqFromApi.allocationsindicator === 'True' ? true : false;
      const allocationStatus = tradeReqFromApi.allocationstatus;
    const approverMessage = tradeReqFromApi.approvermessage;
    const customAttribId: number = +tradeReqFromApi.customattribid;
    let counterparty;

    const broker = _.filter(brokers, {
      id: +tradeReqFromApi.brokerid
    })[0];

    if (tradeReqFromApi.counterpartyid !== '') {
      const privateIndicator =
        tradeReqFromApi.privateindicator === 'True' ? true : false;
      const cpties = this.omsService.getCounterparties(
        tradeReqFromApi.assettype,
        privateIndicator
      );
      counterparty = _.filter(cpties, {
        custodianId: +tradeReqFromApi.counterpartyid
      })[0];
    }

    const security: Security = _.find(securities, {
      id: +tradeReqFromApi.securityid
    });

    // construct trade object
    const trade = new TradeRequest(
      id,
      tradeDate,
      settleDate,
      tranType,
      securityMarketId,
      security,
      quantity,
      price,
      secFee,
      optionFee,
      accrued,
      netMoneyBook,
      netMoneyLocal,
      currency,
      fxRate,
      commissionPerShare,
      broker,
      counterparty,
      pset,
      approverMessage,
      allocationsIndicator,
      allocationStatus,
      comments,
      customAttribId,
      false
    );
    return trade;
  }

  private formatTradeRequestLog(x: any): TradeRequestLog {
    const id = +x.id,
      accruedInterest = parseFloat(x.accruedinterest),
      brokerId = +x.brokerid,
      commission = parseFloat(x.commission),
      currencyId = +x.currencyid,
      fxRate = parseFloat(x.fxrate),
      netMoneyBook = parseFloat(x.netmoneybook),
      netMoneyLocal = parseFloat(x.netmoneylocal),
      price = parseFloat(x.price),
      quantity = parseFloat(x.quantity),
      secFee = parseFloat(x.secfee),
      optionFee = parseFloat(x.optionFee),
      securityId = +x.securityid,
      settleDate = moment(x.settledate, 'MM/DD/YYYY h:mm:ss A'),
      tradeDate = moment(x.tradedate, 'MM/DD/YYYY h:mm:ss A'),
      asOfDate = moment.utc(x.asof, 'MM/DD/YYYY h:mm:ss A'),
      userId = +x.userid;

    return new TradeRequestLog(
      !isNaN(id) ? id : null,
      !isNaN(accruedInterest) ? accruedInterest : null,
      x.action,
      asOfDate.isValid() ? asOfDate.toDate() : null,
      !isNaN(brokerId) ? brokerId : null,
      !isNaN(commission) ? commission : null,
      !isNaN(currencyId) ? currencyId : null,
      x.firstname,
      !isNaN(fxRate) ? fxRate : null,
      x.lastname,
      !isNaN(netMoneyBook) ? netMoneyBook : null,
      !isNaN(netMoneyLocal) ? netMoneyLocal : null,
      !isNaN(price) ? price : null,
      !isNaN(quantity) ? quantity : null,
      !isNaN(secFee) ? secFee : null,
      !isNaN(optionFee) ? optionFee : null,
      !isNaN(securityId) ? securityId : null,
      settleDate.isValid() ? settleDate.toDate() : null,
      tradeDate.isValid() ? tradeDate.toDate() : null,
      x.trantype,
      !isNaN(userId) ? userId : null
    );
  }

  private getTradePutJSON(
    oldTradeReq: TradeRequest,
    newTradeReq: TradeRequest
  ): any {
    const putJSON = {};
    if (newTradeReq.securityMarketId !== oldTradeReq.securityMarketId) {
      putJSON['securitymarketid'] = newTradeReq.securityMarketId.toString();
    }
    if (newTradeReq.tranType !== oldTradeReq.tranType) {
      putJSON['tranType'] = newTradeReq.tranType;
    }
    if (newTradeReq.tradeDate !== oldTradeReq.tradeDate) {
      putJSON['tradeDate'] = moment(newTradeReq.tradeDate).format('MM/DD/YYYY');
    }
    if (newTradeReq.settleDate !== oldTradeReq.settleDate) {
      putJSON['settleDate'] = moment(newTradeReq.settleDate).format(
        'MM/DD/YYYY'
      );
    }
    if (newTradeReq.quantity !== oldTradeReq.quantity) {
      putJSON['quantity'] = newTradeReq.quantity.toString();
    }
    if (newTradeReq.price !== oldTradeReq.price) {
      putJSON['price'] = newTradeReq.price.toString();
    }
    if (newTradeReq.currency.id !== oldTradeReq.currency.id) {
      putJSON['currencyid'] = newTradeReq.currency.id.toString();
    }
    if (newTradeReq.commissionPerShare !== oldTradeReq.commissionPerShare) {
      putJSON['commission'] = newTradeReq.commissionPerShare.toString();
    }
    if (newTradeReq.secFee !== oldTradeReq.secFee) {
      putJSON['secFee'] = newTradeReq.secFee.toString();
    }
    if (newTradeReq.optionFee !== oldTradeReq.optionFee) {
      putJSON['optionFee'] = newTradeReq.optionFee.toString();
    }
    if (newTradeReq.accruedInterest !== oldTradeReq.accruedInterest) {
      putJSON['accruedInterest'] = newTradeReq.accruedInterest.toString();
    }
    if (newTradeReq.fxRate !== oldTradeReq.fxRate) {
      putJSON['fxRate'] = newTradeReq.fxRate.toString();
    }
    if (newTradeReq.netMoneyLocal !== oldTradeReq.netMoneyLocal) {
      putJSON['netMoneyLocal'] = newTradeReq.netMoneyLocal.toString();
    }
    if (newTradeReq.netMoneyBook !== oldTradeReq.netMoneyBook) {
      putJSON['netMoneyBook'] = newTradeReq.netMoneyBook.toString();
    }
    if (newTradeReq.broker.id !== oldTradeReq.broker.id) {
      putJSON['brokerid'] = newTradeReq.broker.id.toString();
    }
    if (newTradeReq.pset.id !== oldTradeReq.pset.id) {
      putJSON['psetid'] = newTradeReq.pset.id.toString();
    }
    if (newTradeReq.counterparty !== oldTradeReq.counterparty) {
      putJSON[
        'counterpartyId'
      ] = newTradeReq.counterparty.custodianId.toString();
    }
    if (newTradeReq.comments !== oldTradeReq.comments) {
      putJSON['comments'] = newTradeReq.comments;
    }

    if (Object.keys(putJSON).length >= 1) {
      putJSON['id'] = newTradeReq.id.toString();
    }

    putJSON['createLog'] = '1';
    return putJSON;
  }

  private getTradePostJSON(tradeRequest: TradeRequest): any {
    const saveTradeRequestBody: any = {
      securityMarketId: tradeRequest.securityMarketId.toString(),
      tranType: tradeRequest.tranType,
      tradeDate: moment(tradeRequest.tradeDate).format('MM/DD/YYYY'),
      settleDate: moment(tradeRequest.settleDate).format('MM/DD/YYYY'),
      quantity: tradeRequest.quantity.toString(),
      price: tradeRequest.price.toString(),
      currencyId: tradeRequest.currency.id.toString(),
      commissionType: 'pershare',
      commission: tradeRequest.commissionPerShare
        ? tradeRequest.commissionPerShare.toString()
        : '0',
      secFee: tradeRequest.secFee ? tradeRequest.secFee.toString() : '0',
      optionFee: tradeRequest.optionFee
        ? tradeRequest.optionFee.toString()
        : '0',
      accruedInterest: tradeRequest.accruedInterest
        ? tradeRequest.accruedInterest.toString()
        : '0',
      fxRate: tradeRequest.fxRate.toString(),
      netMoneyLocal: tradeRequest.netMoneyLocal.toString(),
      netMoneyBook: tradeRequest.netMoneyBook
        ? tradeRequest.netMoneyBook.toString()
        : '0',
      brokerId: tradeRequest.broker.id.toString(),
      PSETId: tradeRequest.pset.id.toString(),
      comments: tradeRequest.comments ? tradeRequest.comments : ''
    };

    if (tradeRequest.counterparty) {
      saveTradeRequestBody.counterpartyId = tradeRequest.counterparty.custodianId.toString();
    }
    return saveTradeRequestBody;
  }

  public formatTradeAuthorization(
    tradeAuth: TradeAuthorizationFromAPI
  ): TradeAuthorization {
    const id = +tradeAuth.id,
      tradeRequestId = +tradeAuth.traderequestid,
      userId = +tradeAuth.userid,
      asOf = tradeAuth.asof;

    return new TradeAuthorization(id, tradeRequestId, asOf, userId);
  }
}
