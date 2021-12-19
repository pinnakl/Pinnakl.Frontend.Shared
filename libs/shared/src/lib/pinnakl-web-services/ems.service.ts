import { Injectable } from '@angular/core';

import {
  ServerSentEventsStreamService,
  WebServiceProvider
} from '@pnkl-frontend/core';
import {
  filter,
  find,
  groupBy,
  isEmpty,
  map as lodashMap,
  reduce,
  uniq
} from 'lodash';

import * as moment from 'moment';

import {
  Broker,
  CurrencyForOMS,
  ExecutionReport,
  ExecutionReportFromApi,
  InternalOrdStatus,
  Order,
  OrderAction,
  OrderDispatch,
  OrderFromAPI,
  OrderTIF,
  OrderType,
  Placement,
  PlacementFromApi,
  QuoteRequest,
  Security,
  StrategyParams,
  TradingCurrency
} from '../models';

// Services
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, from, Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { BrokerService } from './broker.service';
import { SecurityService } from './security';
import {
  EMSBIData,
  EMSBIDataFromApi,
  EMSBusinessIntelligenceFilter
} from '../models/ems';

@Injectable()
export class EMSTradeService {
  private readonly ORDERS_URL = 'orders';
  private readonly SEARCH_ORDERS_URL = 'searchorders';
  private readonly PLACEMENTS_URL = 'placements';
  private readonly ER_URL = 'executionreport';
  private readonly _quotesRequestEndpoint = 'entities/quotes_request';
  private readonly _orderAllocationsEndpoint = 'entities/order_allocations';

  HTTP_REQUEST_HEADERS = new HttpHeaders().set(
    'Content-Type',
    'application/json; charset=utf-8'
  );

  selectedTradeRows$ = new BehaviorSubject<Order[]>(null);
  placeSelectedStagedOrders$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly brokerService: BrokerService,
    private readonly securityService: SecurityService,
    private readonly http: HttpClient,
    private readonly _sse: ServerSentEventsStreamService,
    private readonly wsp: WebServiceProvider
  ) { }

  public subscribeToPlacements(url: string): Observable<any[]> {
    return this._sse
      .subscribeToServerSentEvents(url, [], 'Placement')
      .pipe(map(this.formatPlacementMsg));

    // TODO: left as it is not clear how it was working
    // return this._eventSourceService
    //   .create<any[]>({
    //     eventType: this.EVENT_TYPE,
    //     url: `${this.RESOURCE_URL}?usertoken=${
    //       this._userService.getUser().token
    //     }`
    //   })
    //   .pipe(map(this.formatPlacementMsg));
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
          null,
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
        const unfilledTradeIds = filter(
          trades,
          function (trade: Order): boolean {
            return trade.quantity - trade.filledQty() > 0;
          }
        ).map((trade: Order) => trade.id);

        // Pick one
        const unfilledTradeIndex = Math.floor(
          Math.random() * Math.floor(unfilledTradeIds.length)
        );
        const refTrade: Order = find(trades, {
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
          null,
          null,
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

    const placement = new Placement(
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

    placement.strategyParams = this.formatStrategyParams(
      placementFromApi.StrategyParams
    );
    return placement;
  }

  private formatStrategyParams(strategiesFromApi: any): StrategyParams {
    const strategyParams = { ...strategiesFromApi } as StrategyParams;

    // strategyParams.startDate = moment.utc(strategiesFromApi.startDate, 'MM/DD/YYYY hh:mm:ss A').toDate();
    // strategyParams.endDate = moment.utc(strategiesFromApi.endDate, 'MM/DD/YYYY hh:mm:ss A').toDate();
    // if (strategiesFromApi.displayQty) {
    //   strategyParams.displayQty = +strategiesFromApi.displayQty;
    // }
    //
    // if (strategiesFromApi.maxVolume) {
    //   strategyParams.maxVolume = +strategiesFromApi.maxVolume;
    // }
    //
    // if (strategiesFromApi.minQty) {
    //   strategyParams.minQty = +strategiesFromApi.minQty;
    // }

    return strategyParams;
  }

  public formatER(erFromApi: ExecutionReportFromApi): ExecutionReport {
    const id = +erFromApi.Id;
    const refOrderId = +erFromApi.PnklPlacementId;
    const status = erFromApi.Status;
    const execType = erFromApi.ExecType;
    const orderQty = +erFromApi.OrderQty;
    const lastQty = +erFromApi.LastQty;
    const cumQty = +erFromApi.CumQty;
    const leftQty = +erFromApi.LeftQty;
    const avgPrc = +erFromApi.AvgPrc;
    const lastPrc = +erFromApi.LastPrc;
    const time = moment
      .utc(new Date(Date.parse(`${erFromApi.Timestamp}Z`)))
      .toDate();

    const er = new ExecutionReport(
      id,
      refOrderId,
      status,
      execType,
      erFromApi.MsgType,
      orderQty,
      null,
      time,
      lastQty,
      cumQty,
      leftQty,
      avgPrc,
      lastPrc
    );

    return er;
  }

  public async getRecentEMSTrades(
    tradingCurrency: CurrencyForOMS[],
    brokers: Broker[],
    securities: Security[]
  ): Promise<Order[]> {
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
    const currency = filter(tradingCurrencies, {
      currency: emsTradeFromAPI.currency
    })[0];

    const broker = filter(brokers, {
      id: +emsTradeFromAPI.brokerid
    })[0];

    const security = filter(securities, {
      id: +emsTradeFromAPI.securityid
    })[0];

    const securitysecondary = filter(securities, {
      id: +emsTradeFromAPI.securityidsecondary
    })[0];

    let placements = [];
    placements = emsTradeFromAPI.placements.map(q => this.formatPlacement(q));

    const order = new Order(
      +emsTradeFromAPI.id,
      moment.utc(emsTradeFromAPI.tradedate, 'MM/DD/YYYY hh:mm:ss A').toDate(),
      // new Date(Date.parse(emsTradeFromAPI.tradedate)),
      emsTradeFromAPI.trtype.toLowerCase(),
      security,
      securitysecondary,
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

    order.traderText = emsTradeFromAPI.tradertext;
    return order;
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
        tradeDate: moment.utc(order._tradeDate),
        securityId: order.security.id,
        securityIdSecondary: order.securitySecondary
          ? order.securitySecondary.id
          : null,
        trType: order.tranType,
        quantity: order.quantity,
        type: order.type,
        tif: order.tif,
        stopPrice: order.stopPrice,
        limitPrice: order.limitPrice,
        brokerId: order.broker.id,
        orderStatus: order.internalStatus,
        traderText: order.traderText,
        strategyParams: order?.strategyParams
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

  public postQuoteRequest(req: any): Promise<QuoteRequest> {
    return this.wsp.postHttp({
      endpoint: this._quotesRequestEndpoint,
      body: req
    });
  }

  async postOrderAllocations(
    orderId: number,
    allocations: { accountId: number; quantity: number }[]
  ): Promise<any> {
    const orderAllocReqData = {
      parentOrderId: orderId.toString(),
      allocations: JSON.stringify(allocations)
    };

    return this.wsp.postHttp({
      endpoint: this._orderAllocationsEndpoint,
      body: orderAllocReqData
    });
  }

  putOrderAllocation(allocation: {
    id: number;
    parentOrderId: number;
    accountId: number;
    quantity: number;
  }): Observable<any> {
    const orderAllocReqData = {
      id: allocation.id.toString(),
      parentorderid: allocation.parentOrderId.toString(),
      accountid: allocation.accountId.toString(),
      quantity: allocation.quantity.toString()
    };

    return from(
      this.wsp.putHttp({
        endpoint: this._orderAllocationsEndpoint,
        body: orderAllocReqData
      })
    );
  }

  getOrderAllocations(orderId: number): Observable<any> {
    return from(
      this.wsp.getHttp({
        endpoint: this._orderAllocationsEndpoint,
        params: {
          filters: [
            {
              key: 'parentorderid',
              type: 'EQ',
              value: [orderId.toString()]
            }
          ]
        }
      })
    ).pipe(
      map(allocations =>
        !isEmpty(allocations) ? this.mapAllocationsFromApi(allocations) : null
      )
    );
  }

  formatMany(
    entities: EMSBIDataFromApi[],
    groupingKey: string,
    startDate: any,
    endDate: any
  ): EMSBIData[] {
    const sectorName = groupingKey.toLowerCase();
    const filteredEntities = entities.filter(
      el => el[sectorName] || el[sectorName] === ''
    );
    const sectors = uniq(filteredEntities.map(el => el[sectorName])).reduce(
      (obj, key) => ({ ...obj, [key === '' ? 'BLANK' : key.toUpperCase()]: 0 }),
      {}
    );

    const mappedEntities = lodashMap(
      filteredEntities,
      e =>
        ({
          date: moment(e.tradedate, 'MM/DD/YYYY').toDate(),
          [e[sectorName.toLowerCase()] === ''
            ? 'BLANK'
            : e[sectorName.toLowerCase()].toUpperCase()]: +e.value
        } as EMSBIData)
    );
    const groupedByDate = groupBy(mappedEntities, e => e.date);
    const mappedToGroupedByDateDefault = lodashMap(groupedByDate, e => {
      const propsPerDay = reduce(
        e,
        (general, current) => ({ ...general, ...current }),
        {}
      );
      return propsPerDay;
    }).map(x => ({ ...sectors, ...x })) as EMSBIData[];

    const zeroPropNames = [] as string[];
    Object.keys(sectors).forEach(s => {
      const eachZero = mappedToGroupedByDateDefault.every(x => !x[s]);
      if (eachZero) {
        zeroPropNames.push(s);
      }
    });
    mappedToGroupedByDateDefault.forEach(entity => {
      zeroPropNames.forEach(prop => delete entity[prop]);
    });

    const result = [];
    result.push({
      date: moment(startDate, 'MM/DD/YYYY').toDate(),
      ...(mappedToGroupedByDateDefault.find(el =>
        moment(startDate, 'MM/DD/YYYY').isSame(
          moment(el.date, 'MM/DD/YYYY'),
          'day'
        )
      ) || sectors)
    } as EMSBIData);

    while (startDate.add(1, 'days').diff(endDate) < 0) {
      result.push({
        date: moment(startDate, 'MM/DD/YYYY').toDate(),
        ...(mappedToGroupedByDateDefault.find(el =>
          moment(startDate, 'MM/DD/YYYY').isSame(
            moment(el.date, 'MM/DD/YYYY'),
            'day'
          )
        ) || sectors)
      } as EMSBIData);
    }

    result.push({
      date: moment(endDate, 'MM/DD/YYYY').toDate(),
      ...(mappedToGroupedByDateDefault.find(el =>
        moment(endDate, 'MM/DD/YYYY').isSame(
          moment(el.date, 'MM/DD/YYYY'),
          'day'
        )
      ) || sectors)
    } as EMSBIData);

    return result;
  }

  getTradingVolumeChartData({
    startDate,
    endDate,
    dataType,
    groupingField,
    ...otherTradingDataFilters
  }: EMSBusinessIntelligenceFilter): Observable<EMSBIData[]> {
    const startdate = moment(startDate, 'MM/DD/YYYY');
    const enddate = moment(endDate, 'MM/DD/YYYY');
    let filters = [
      { key: 'startdate', type: 'EQ', value: [startdate] },
      { key: 'enddate', type: 'EQ', value: [enddate] },
      { key: 'groupingkey', type: 'EQ', value: [groupingField] },
      { key: 'value', type: 'EQ', value: [dataType?.toLowerCase()] }
    ];
    filters = filters.concat(
      lodashMap(otherTradingDataFilters, (value, key) => ({
        key: key.split(' ').join(''),
        type: 'EQ',
        value: [value?.toString() || null]
      }))
    );
    return from(
      this.wsp.getHttp<any[]>({
        endpoint: 'entities/ems_bi',
        params: {
          filters
        }
      })
    ).pipe(
      map((entities: EMSBIDataFromApi[]) =>
        this.formatMany(entities, groupingField, startdate, enddate)
      )
    );
  }

  getAdditionalFiltersValues(
    startDate: any,
    endDate: any,
    filterName: string
  ): Promise<any> {
    return this.wsp.getHttp({
      endpoint: 'entities/ems_bi_filter_values',
      params: {
        filters: [
          {
            key: 'startdate',
            type: 'EQ',
            value: [moment(startDate, 'MM/DD/YYYY')]
          },
          {
            key: 'enddate',
            type: 'EQ',
            value: [moment(endDate, 'MM/DD/YYYY')]
          },
          {
            key: 'filterfield',
            type: 'EQ',
            value: [filterName?.split(' ').join('')]
          }
        ]
      }
    });
  }

  private mapAllocationsFromApi(
    allocationsFromApi: any
  ): { accountId: number; quantity: number }[] {
    return allocationsFromApi.map(allocation => {
      return {
        id: +allocation?.id,
        parentOrderId: +allocation?.parentorderid,
        accountId: +allocation?.accountid,
        quantity: +allocation?.quantity
      };
    });
  }
}
