// Angular
import { Injectable } from '@angular/core';
import {
  TradeAuthorization,
  TradeAuthorizationFromAPI
} from './../models/oms/trade-authorization.model';

// Third party libs
import * as _ from 'lodash';
import * as moment from 'moment';

// Models
import {
  DeleteWebRequest,
  GetWebRequest,
  PostWebRequest,
  PutWebRequest,
  WebServiceProvider
} from '@pnkl-frontend/core';

import { Broker } from '../models/oms/broker/broker.model';
import { PSET } from '../models/oms/pset.model';
import { TradeRequestLog } from '../models/oms/trade-request-log.model';
import { TradeRequestFromApi } from '../models/oms/trade-request.model';
import { TradeRequest } from '../models/oms/trade-request.model';
import { TradingCurrency } from '../models/oms/trading-currency.model';
import { Security } from '../models/security/security.model';
import { CurrencyForOMS } from './../models/oms/currency.model';
import { TradeExecutionReporting } from './../models/oms/trade-execution-reporting.model';

// Services
import {
  TradeRequestAllocation,
  TradeRequestAllocationFromAPI
} from '../models/oms/trade-request-allocations.model';
import { OMSService } from '../pinnakl-web-services/oms.service';
import { TradeAllocationService } from './trade-allocation.service';

@Injectable()
export class TradeService {
  private readonly TRADE_REQUEST_API_URL = 'trade_requests';
  private readonly TRADE_REQUEST_LOG_API_URL = 'trade_requests_log';
  private readonly TRADE_REQUEST_ALLOCATION_API = 'trade_request_allocations';

  private readonly TRADE_EXECUTION_REPORTING_API_URL =
    '/trade_execution_reporting';

  private readonly TRADE_REQUEST_FIELDS = [
    'tradeid',
    'securityId',
    'securityMarketId',
    'tranType',
    'tradeDate',
    'settleDate',
    'assetType',
    'trsIndicator',
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
    'psetid',
    'customattribId',
    'counterpartyId',
    'comments',
    'approverMessage'
  ];
  private TRADE_AUTHORIZATIONS_API = 'trade_authorizations';
  private allocationImpactingFields = [
    'tranType',
    'tradedate',
    'quantity',
    'counterpartyId',
    'allocationId'
  ];

  constructor(
    private wsp: WebServiceProvider,
    private omsService: OMSService,
    private tradeAllocationService: TradeAllocationService
  ) {}

  public getMostRecentTradeRequests({
    from,
    to,
    date,
    requestFromServer
  }: {
    from: number;
    to: number;
    date: Date;
    requestFromServer: boolean;
  }): Promise<TradeRequest[]> {
    const getWebRequest: GetWebRequest = {
      endPoint: this.TRADE_REQUEST_API_URL,
      options: {
        fields: this.TRADE_REQUEST_FIELDS,
        filters: [
          {
            key: '',
            type: 'RANGE',
            value: [from.toString(), to.toString()]
          }
        ],
        orderBy: [
          {
            field: 'tradedate',
            direction: 'DESC'
          }
        ]
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then((tradeRequests: TradeRequestFromApi[]) => {
        return this.getTradeRequestSetterDependencies(
          date,
          requestFromServer
        ).then(result => {
          return tradeRequests.map(tradeRequest =>
            this.formatTradeRequest(tradeRequest, result)
          );
        });
      });
  }

  public getTradeRequest(tradeId: number): Promise<TradeRequest> {
    const getWebRequest: GetWebRequest = {
      endPoint: 'trade_requests',
      options: {
        id: tradeId.toString()
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then((tradeRequest: TradeRequestFromApi) => {
        const tradeDate = moment(
          tradeRequest[0].tradedate,
          'MM/DD/YYYY hh:mm:ss A'
        ).toDate();
        return this.getTradeRequestSetterDependencies(tradeDate, false).then(
          result => {
            return this.formatTradeRequest(tradeRequest[0], result);
          }
        );
      });
  }

  async tradesExistForSecurityMarketId(
    securityMarketIds: number[]
  ): Promise<number[]> {
    const tradeRequests: any[] = await this.wsp.get({
      endPoint: this.TRADE_REQUEST_API_URL,
      options: {
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

  public getTradeRequestLogs(tradeId: number): Promise<TradeRequestLog[]> {
    if (tradeId) {
      const fields = [
        'Id',
        'action',
        'UserId',
        'tranType',
        'tradeDate',
        'settleDate',
        'assetType',
        'trsIndicator',
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

      const getWebRequest: GetWebRequest = {
        endPoint: this.TRADE_REQUEST_LOG_API_URL,
        options: {
          fields: fields,
          filters: [{ key: 'tradeId', type: 'EQ', value: [tradeId.toString()] }]
        }
      };

      return this.wsp
        .get(getWebRequest)
        .then(result => result.map(x => this.formatTradeRequestLog(x)));
    }
  }

  public saveTradeRequest(tradeReq: TradeRequest): Promise<any> {
    const saveTradeRequestBody = this.getTradePostJSON(tradeReq);
    const postWebRequest: PostWebRequest = {
      endPoint: this.TRADE_REQUEST_API_URL,
      payload: saveTradeRequestBody
    };
    return this.wsp.post(postWebRequest);
  }

  public updateTradeRequest(
    oldTradeReq: TradeRequest,
    newTradeReq: TradeRequest,
    deleteChildAllocationsFlag: boolean
  ): Promise<any> {
    const updatedTradeJSON = this.getTradePutJSON(oldTradeReq, newTradeReq);

    return this.handleChildAllocationDeletion(
      updatedTradeJSON,
      deleteChildAllocationsFlag,
      newTradeReq.id
    ).then(result => {
      if (Object.keys(updatedTradeJSON).length > 1) {
        const putWebRequest: PutWebRequest = {
          endPoint: this.TRADE_REQUEST_API_URL,
          payload: updatedTradeJSON
        };
        return this.wsp.put(putWebRequest);
      } else {
        if (
          Object.keys(updatedTradeJSON).length === 0 ||
          (Object.keys(updatedTradeJSON).length === 1 &&
            Object.keys(updatedTradeJSON)[0].toLowerCase() === 'id')
        ) {
          return Promise.resolve(newTradeReq);
        } else {
          return Promise.reject('The JSON to update the trade is incorrect');
        }
      }
    });
  }

  public deleteTradeRequest(tradeId: number): Promise<any> {
    const deleteTradeJSON = {
      id: tradeId
    };

    const deleteWebRequest: DeleteWebRequest = {
      endPoint: this.TRADE_REQUEST_API_URL,
      payload: deleteTradeJSON
    };

    return this.wsp.delete(deleteWebRequest);
  }

  public getTradeRequestSetterDependencies(
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
      this.omsService.getAllSecurities(requestFromServer),
      this.omsService.getPBAccounts(),
      this.omsService.getHolidays()
    ]);
  }

  public getTradeApprover(tReqId: number): Promise<any> {
    const fields = ['id', 'traderequestid', 'userid', 'asOf'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.TRADE_AUTHORIZATIONS_API,
      options: {
        fields: fields,
        filters: [
          {
            key: 'traderequestid',
            type: 'EQ',
            value: [tReqId.toString()]
          }
        ]
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then(result => result.map(x => this.formatTradeAuthorization(x)));
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

  public getTradeRequestAllocations(
    tReqId: number
  ): Promise<TradeRequestAllocation> {
    const fields = ['id', 'traderequestid', 'accountId', 'quantity'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.TRADE_REQUEST_ALLOCATION_API,
      options: {
        fields: fields,
        filters: [
          {
            key: 'traderequestid',
            type: 'EQ',
            value: [tReqId.toString()]
          }
        ]
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then(result => result.map(x => this.formatTradeRequestAllocations(x)));
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
    const trs = tradeReqFromApi.trsindicator === 'True' ? true : false;
    const comments = tradeReqFromApi.comments;
    const allocationsIndicator =
      tradeReqFromApi.allocationsindicator === 'True' ? true : false;
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
        trs,
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
      trs,
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
      comments,
      customAttribId,
      false
    );
    return trade;
  }

  private formatTradeRequestLog(x): TradeRequestLog {
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
      asOfDate = moment(x.asof, 'MM/DD/YYYY h:mm:ss A'),
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
      x.trsindicator === 'True' ? true : false,
      !isNaN(userId) ? userId : null
    );
  }

  private getTradePutJSON(
    oldTradeReq: TradeRequest,
    newTradeReq: TradeRequest
  ): any {
    const putJSON = {};
    if (newTradeReq.securityMarketId !== oldTradeReq.securityMarketId) {
      putJSON['securitymarketid'] = newTradeReq.securityMarketId;
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
    if (newTradeReq.trs !== oldTradeReq.trs) {
      putJSON['trsindicator'] =
        newTradeReq.trs && newTradeReq.trs === true ? 1 : 0;
    }
    if (newTradeReq.quantity !== oldTradeReq.quantity) {
      putJSON['quantity'] = newTradeReq.quantity;
    }
    if (newTradeReq.price !== oldTradeReq.price) {
      putJSON['price'] = newTradeReq.price;
    }
    if (newTradeReq.currency.id !== oldTradeReq.currency.id) {
      putJSON['currencyid'] = newTradeReq.currency.id;
    }
    if (newTradeReq.commissionPerShare !== oldTradeReq.commissionPerShare) {
      putJSON['commission'] = newTradeReq.commissionPerShare;
    }
    if (newTradeReq.secFee !== oldTradeReq.secFee) {
      putJSON['secFee'] = newTradeReq.secFee;
    }
    if (newTradeReq.optionFee !== oldTradeReq.optionFee) {
      putJSON['optionFee'] = newTradeReq.optionFee;
    }
    if (newTradeReq.accruedInterest !== oldTradeReq.accruedInterest) {
      putJSON['accruedInterest'] = newTradeReq.accruedInterest;
    }
    if (newTradeReq.fxRate !== oldTradeReq.fxRate) {
      putJSON['fxRate'] = newTradeReq.fxRate;
    }
    if (newTradeReq.netMoneyLocal !== oldTradeReq.netMoneyLocal) {
      putJSON['netMoneyLocal'] = newTradeReq.netMoneyLocal;
    }
    if (newTradeReq.netMoneyBook !== oldTradeReq.netMoneyBook) {
      putJSON['netMoneyBook'] = newTradeReq.netMoneyBook;
    }
    if (newTradeReq.broker.id !== oldTradeReq.broker.id) {
      putJSON['brokerid'] = newTradeReq.broker.id;
    }
    if (newTradeReq.pset.id !== oldTradeReq.pset.id) {
      putJSON['psetid'] = newTradeReq.pset.id;
    }
    if (newTradeReq.counterparty !== oldTradeReq.counterparty) {
      putJSON['counterpartyId'] = newTradeReq.counterparty.custodianId;
    }
    if (newTradeReq.comments !== oldTradeReq.comments) {
      putJSON['comments'] = newTradeReq.comments;
    }

    if (Object.keys(putJSON).length >= 1) {
      putJSON['id'] = newTradeReq.id;
    }
    return putJSON;
  }
  private getTradePostJSON(tradeRequest: TradeRequest): any {
    const saveTradeRequestBody: any = {
      securityMarketId: tradeRequest.securityMarketId,
      tranType: tradeRequest.tranType,
      tradeDate: moment(tradeRequest.tradeDate).format('MM/DD/YYYY'),
      settleDate: moment(tradeRequest.settleDate).format('MM/DD/YYYY'),
      quantity: tradeRequest.quantity,
      price: tradeRequest.price,
      currencyId: tradeRequest.currency.id,
      commissionType: 'pershare',
      commission: tradeRequest.commissionPerShare
        ? tradeRequest.commissionPerShare
        : 0,
      secFee: tradeRequest.secFee ? tradeRequest.secFee : 0,
      optionFee: tradeRequest.optionFee ? tradeRequest.optionFee : 0,
      accruedInterest: tradeRequest.accruedInterest
        ? tradeRequest.accruedInterest
        : 0,
      fxRate: tradeRequest.fxRate,
      netMoneyLocal: tradeRequest.netMoneyLocal,
      netMoneyBook: tradeRequest.netMoneyBook ? tradeRequest.netMoneyBook : 0,
      brokerId: tradeRequest.broker.id,
      PSETId: tradeRequest.pset.id,
      trsindicator: tradeRequest.trs && tradeRequest.trs === true ? 1 : 0,
      comments: tradeRequest.comments ? tradeRequest.comments : ''
    };

    if (tradeRequest.counterparty) {
      saveTradeRequestBody.counterpartyId =
        tradeRequest.counterparty.custodianId;
    }
    return saveTradeRequestBody;
  }

  public getTradeExecutionReporting(
    tradeRequestId: number
  ): Promise<TradeExecutionReporting> {
    const fields = ['Id', 'SendToBroker', 'SendToCustodian', 'SendToAdmin'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.TRADE_EXECUTION_REPORTING_API_URL,
      options: {
        fields: fields,
        filters: [
          {
            key: 'TradeId',
            type: 'EQ',
            value: [tradeRequestId.toString()]
          }
        ]
      }
    };

    return this.wsp.get(getWebRequest).then(result => {
      return {
        id: +result[0]['id'],
        sendToBroker: result[0]['sendtobroker'] === 'True' ? true : false,
        sendToAdmin: result[0]['sendtoadmin'] === 'True' ? true : false,
        sendToCustodian: result[0]['sendtocustodian'] === 'True' ? true : false
      };
    });
  }

  public putTradeExecutionReporting(
    tradeExec: TradeExecutionReporting
  ): Promise<any> {
    const updatedTradeJSON = {
      id: tradeExec.id,
      sendToBroker: tradeExec.sendToBroker === true ? 1 : 0,
      sendToAdmin: tradeExec.sendToAdmin === true ? 1 : 0,
      sendToCustodian: tradeExec.sendToCustodian === true ? 1 : 0
    };

    const putWebRequest: PutWebRequest = {
      endPoint: this.TRADE_EXECUTION_REPORTING_API_URL,
      payload: updatedTradeJSON
    };

    return this.wsp.put(putWebRequest);
  }

  private handleChildAllocationDeletion(
    updatedTradeJSON: any,
    tradeRequestAllocationsChanged: boolean,
    tradeRequestId: number
  ): Promise<any> {
    if (
      _.intersection(
        this.allocationImpactingFields,
        Object.keys(updatedTradeJSON)
      ).length > 0 ||
      tradeRequestAllocationsChanged
    ) {
      return this.tradeAllocationService.deleteAllocationsFromTradeRequestId(
        tradeRequestId
      );
    } else {
      return Promise.resolve(null);
    }
  }

  saveTradeRequestAllocation(
    tradeRequestAllocation: TradeRequestAllocation
  ): Promise<any> {
    const postWebRequest: PostWebRequest = {
      endPoint: this.TRADE_REQUEST_ALLOCATION_API,
      payload: {
        TradeRequestId: tradeRequestAllocation.tradeRequestId,
        AccountId: tradeRequestAllocation.accountId,
        Quantity: tradeRequestAllocation.quantity
      }
    };

    return this.wsp.post(postWebRequest);
  }

  saveTradeRequestAllocations(
    saveAllocationsArray: TradeRequestAllocation[]
  ): Promise<TradeRequestAllocation[]> {
    return new Promise((resolve, reject) => {
      let insertCount = 0;
      const newTradeAllocations: TradeRequestAllocation[] = [];
      saveAllocationsArray.forEach(tradeAllocationToSave => {
        this.saveTradeRequestAllocation(tradeAllocationToSave).then(result => {
          insertCount += 1;
          newTradeAllocations.push(
            new TradeRequestAllocation(
              parseFloat(result.id),
              parseFloat(result.traderequestid),
              parseFloat(result.accountid),
              parseFloat(result.quantity)
            )
          );
          if (saveAllocationsArray.length === insertCount) {
            insertCount = 0;
            resolve(newTradeAllocations);
          }
        });
      });
    });
  }

  deleteTradeRequestAllocation(
    tradeRequestAllocation: TradeRequestAllocation
  ): Promise<any> {
    const deleteWebRequest: DeleteWebRequest = {
      endPoint: this.TRADE_REQUEST_ALLOCATION_API,
      payload: {
        id: tradeRequestAllocation.id.toString()
      }
    };

    return this.wsp.delete(deleteWebRequest);
  }

  deleteTradeRequestAllocations(
    deleteAllocationsArray: TradeRequestAllocation[]
  ): Promise<TradeRequestAllocation[]> {
    return new Promise((resolve, reject) => {
      let deleteCount = 0;
      const deletedTradeAllocations: TradeRequestAllocation[] = [];
      deleteAllocationsArray.forEach(allocatedTrade => {
        this.deleteTradeRequestAllocation(allocatedTrade).then(result => {
          deleteCount += 1;
          deletedTradeAllocations.push(result);
          if (deleteAllocationsArray.length === deleteCount) {
            deleteCount = 0;
            resolve(deletedTradeAllocations);
          }
        });
      });
    });
  }
}
