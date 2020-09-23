import { Injectable } from '@angular/core';

import { WebServiceProvider, WebServiceUtility } from '@pnkl-frontend/core';

// Third party libs
import * as _ from 'lodash';
import * as moment from 'moment';

import { Broker } from '@pnkl-frontend/shared';
import {
  InternalOrdStatus,
  OrderAction,
  OrderDispatch,
  OrderTIF,
  OrderType,
  Placement,
  PlacementFromApi
} from '@pnkl-frontend/shared';
import { Order, OrderFromAPI } from '@pnkl-frontend/shared';
import { TradingCurrency } from '../models/oms/trading-currency.model';
import { Security } from '../models/security/security.model';
import { CurrencyForOMS } from './../models/oms/currency.model';
import {
  ExecutionReport,
  ExecutionReportFromApi
} from './../models/oms/trade-fills.model';

// Services
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventSourceService, UserService } from '@pnkl-frontend/core';
import { BrokerService, SecurityService } from '@pnkl-frontend/shared';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../apps/platform-web-app/src/environments';

@Injectable()
export class EMSTradeService {
  private readonly RESOURCE_URL = `${environment.sseAppUrl}Placement/Subscribe`;
  private readonly EVENT_TYPE = 'message';
  private readonly ORDERS_URL = 'orders';
  private readonly SEARCH_ORDERS_URL = 'searchorders';
  private readonly PLACEMENTS_URL = 'placements';
  private readonly ER_URL = 'executionreport';

  HTTP_REQUEST_HEADERS = new HttpHeaders().set(
    'Content-Type',
    'application/json; charset=utf-8'
  );

  constructor(
    private brokerService: BrokerService,
    private securityService: SecurityService,
    private http: HttpClient,
    private _userService: UserService,
    private _eventSourceService: EventSourceService
  ) {}

  public subscribeToPlacements(): Observable<any[]> {
    return this._eventSourceService
      .create<any[]>({
        eventType: this.EVENT_TYPE,
        url: `${this.RESOURCE_URL}?usertoken=${
          this._userService.getUser().token
        }`
      })
      .pipe(map(this.formatPlacementMsg));
  }

  public formatPlacementMsg(data: any): any {
    console.log('This is SSE placement message received');
    console.log(data);
    return data;
  }
  public OrdersStream(
    currencies: CurrencyForOMS[],
    brokers: Broker[],
    securities: Security[]
  ): Observable<any> {
    return timer(0, 1000).pipe(
      map(() => {
        const currencyId = Math.floor(
          Math.random() * Math.floor(currencies.length)
        );
        const id = Math.floor(Math.random() * Math.floor(25000));
        const brokerId = Math.floor(Math.random() * Math.floor(brokers.length));
        const secId = Math.floor(Math.random() * Math.floor(securities.length));
        const quantity = Math.floor(Math.random() * Math.floor(5000));
        const price = Math.floor(Math.random() * Math.floor(60));

        return new Order(
          id,
          new Date(),
          'B',
          securities[secId],
          quantity,
          'LMT',
          'DAY',
          0,
          price,
          currencies[currencyId],
          brokers[brokerId],
          'Approved',
          [],
          'STAGED',
          'Tarun K'
        );
      })
    );
  }

  public fillSteam(trades: Order[]): Observable<ExecutionReport> {
    return timer(20, 1).pipe(
      map(() => {
        const id = Math.floor(Math.random() * Math.floor(100));

        // Find unfilled Trades Ids
        const unfilledTradeIds = _.filter(trades, function (
          trade: Order
        ): boolean {
          return trade.quantity - trade.filledQty() > 0;
        }).map((trade: Order) => trade.id);

        // Pick one
        const unfilledTradeIndex = Math.floor(
          Math.random() * Math.floor(unfilledTradeIds.length)
        );
        const refTrade: Order = _.find(trades, {
          id: unfilledTradeIds[unfilledTradeIndex]
        });

        // Find remaining quanity
        const remaining = refTrade.quantity - refTrade.filledQty();

        const filledQuant =
          remaining > 100
            ? Math.floor(Math.random() * Math.floor(remaining))
            : remaining;
        const price = Math.floor(Math.random() * Math.floor(60));

        return new ExecutionReport(
          id, // Id
          refTrade.id, // OrderId
          null, // Order Status
          null, // Order Qty
          null, // Order Prc
          new Date(), // As Of
          filledQuant, // Fill Amount
          null,
          null, // Remaining
          price, // Avg Price
          price // Fill Price
        );
      })
    );
  }

  public getEMSTradeRequestSetterDependencies(): Promise<any> {
    return Promise.all([
      this.getTradingCurrencies(),
      this.brokerService.getBrokersHTTP(),
      this.securityService.getAllTradingSecurities()
    ]);
  }

  public async getPlacement(id: number): Promise<Placement> {
    let placement: Placement;

    const ORDERS_URL = `${this.PLACEMENTS_URL}\\${id}`;
    return this.http
      .get(ORDERS_URL)
      .toPromise()
      .then((placementapidata: PlacementFromApi) => {
        placement = this.formatPlacement(placementapidata);
        return placement;
      });
  }

  public async getER(id: number): Promise<ExecutionReport> {
    let er: ExecutionReport;

    const ORDERS_URL = `${this.ER_URL}\\${id}`;
    return this.http
      .get(ORDERS_URL)
      .toPromise()
      .then((erData: ExecutionReportFromApi) => {
        er = this.formatER(erData);
        return er;
      });
  }

  public formatPlacement(placementFromApi: PlacementFromApi): Placement {
    let executionReports = [];

    if (placementFromApi.ers !== null) {
      executionReports = placementFromApi.ers.map(p => this.formatER(p));
    }

    return new Placement(
      +placementFromApi.Id,
      +placementFromApi.ParentOrderId,
      placementFromApi.Action,
      moment.utc(placementFromApi.Timestamp).toDate(),
      +placementFromApi.OrderQty,
      <OrderType>placementFromApi.OrderType,
      <OrderTIF>placementFromApi.TIF,
      +placementFromApi.LimitPrice,
      +placementFromApi.StopPrice,
      executionReports
    );
  }

  public formatER(erFromApi: ExecutionReportFromApi): ExecutionReport {
    const id = +erFromApi.Id;
    const refOrderId = +erFromApi.PnklPlacementId;
    const status = erFromApi.Status;
    const orderQty = +erFromApi.OrderQty;
    const lastQty = +erFromApi.LastQty;
    const cumQty = +erFromApi.CumQty;
    const leftQty = +erFromApi.LeftQty;
    const avgPrc = +erFromApi.AvgPrc;
    const fillPrc = +erFromApi.FillPrc;
    const time = moment
      .utc(new Date(Date.parse(erFromApi.Timestamp + 'Z')))
      .toDate();

    const er = new ExecutionReport(
      id,
      refOrderId,
      status,
      orderQty,
      null,
      time,
      lastQty,
      cumQty,
      leftQty,
      avgPrc,
      fillPrc
    );

    return er;
  }

  public async getRecentEMSTrades(
    tradingCurrency: CurrencyForOMS[],
    brokers: Broker[],
    securities: Security[]
  ): Promise<Order[]> {
    let orders: Order[];

    return this.http
      .get(this.ORDERS_URL)
      .toPromise()
      .then((ordersapidata: OrderFromAPI[]) => {
        return ordersapidata.map(p =>
          this.formatEMSTradeRequest(tradingCurrency, brokers, securities, p)
        );
      })
      .catch(error => {
        throw error;
      });
  }

  public async getEMSTradesWithDates(
    tradingCurrency: CurrencyForOMS[],
    brokers: Broker[],
    securities: Security[],
    payload: {
      startdate?: string;
      enddate?: string;
    }
  ): Promise<Order[]> {
    try {
      const orders = (await this.http
        .post(this.SEARCH_ORDERS_URL, payload)
        .toPromise()) as OrderFromAPI[];
      return orders.map(p =>
        this.formatEMSTradeRequest(tradingCurrency, brokers, securities, p)
      );
    } catch (e) {
      throw e;
    }
  }

  public formatEMSTradeRequest(
    tradingCurrencies: CurrencyForOMS[],
    brokers: Broker[],
    securities: Security[],
    emsTradeFromAPI: OrderFromAPI
  ): Order {
    const currency = _.filter(tradingCurrencies, {
      currency: emsTradeFromAPI.currency
    })[0];

    const broker = _.filter(brokers, {
      id: +emsTradeFromAPI.brokerid
    })[0];

    const security = _.filter(securities, {
      id: +emsTradeFromAPI.securityid
    })[0];

    let placements = [];
    placements = emsTradeFromAPI.placements.map(q => this.formatPlacement(q));

    return new Order(
      +emsTradeFromAPI.id,
      moment.utc(emsTradeFromAPI.tradedate, 'MM/DD/YYYY hh:mm:ss A').toDate(),
      // new Date(Date.parse(emsTradeFromAPI.tradedate)),
      emsTradeFromAPI.trtype.toLowerCase(),
      security,
      +emsTradeFromAPI.quantity,
      <OrderType>emsTradeFromAPI.type.toLowerCase(),
      <OrderTIF>emsTradeFromAPI.tif.toLowerCase(),
      emsTradeFromAPI.stopprice,
      emsTradeFromAPI.limitprice,
      currency,
      broker,
      '',
      placements,
      <InternalOrdStatus>emsTradeFromAPI.orderstatus,
      emsTradeFromAPI.name
    );
  }

  public getTradingCurrencies(): Promise<CurrencyForOMS[]> {
    return Promise.resolve([
      new TradingCurrency(46, 3, 'CAD'),
      new TradingCurrency(47, 21, 'USD')
    ]);
  }

  public getOrder(
    id: number,
    tradingCurrency: CurrencyForOMS[],
    brokers: Broker[],
    securities: Security[]
  ): Promise<Order> {
    let order: Order;

    return this.http
      .get(`${this.ORDERS_URL}\\${id}`)
      .toPromise()
      .then((orderapidata: OrderFromAPI[]) => {
        order = this.formatEMSTradeRequest(
          tradingCurrency,
          brokers,
          securities,
          orderapidata[0]
        );

        return order;
      })
      .catch(error => {
        throw error;
      });
  }

  public async insertStagedTrade(order: Order): Promise<number> {
    const orderJson = this.getOrderJson('STAGE', order);

    return this.http
      .post<any>(this.ORDERS_URL, JSON.stringify(orderJson), {
        headers: this.HTTP_REQUEST_HEADERS
      })
      .toPromise()
      .then((newOrderID: number) => {
        return newOrderID;
      });
  }

  public async updateStagedTrade(order: Order): Promise<number> {
    const orderJson = this.getOrderJson('STAGE', order);

    return this.http
      .put<any>(this.ORDERS_URL, orderJson, {
        headers: this.HTTP_REQUEST_HEADERS
      })
      .toPromise()
      .then((newOrderID: number) => {
        return newOrderID;
      });
  }

  public async deleteStagedOrder(id: number): Promise<number> {
    return this.http
      .delete<any>(`${this.ORDERS_URL}/${id}`)
      .toPromise()
      .then((newOrderID: number) => {
        return newOrderID;
      });
  }

  public getOrderJson(action: OrderAction, order: Order): any {
    return {
      action: action.toUpperCase(),
      order: {
        id: order.id,
        tradeDate: moment.utc(order.tradeDate),
        securityId: order.security.id,
        trType: order.tranType,
        quantity: order.quantity,
        type: order.type,
        tif: order.tif,
        stopPrice: order.stopPrice,
        limitPrice: order.limitPrice,
        brokerId: order.broker.id,
        orderStatus: order.internalStatus
      }
    };
  }

  public postPlacement(orderDipatch: OrderDispatch): Promise<number> {
    const orderJson = this.getOrderJson(
      orderDipatch.action,
      orderDipatch.order
    );

    return this.http
      .post<any>(this.ORDERS_URL, JSON.stringify(orderJson))
      .toPromise()
      .then((newOrderID: number) => {
        return newOrderID;
      });
  }
}
