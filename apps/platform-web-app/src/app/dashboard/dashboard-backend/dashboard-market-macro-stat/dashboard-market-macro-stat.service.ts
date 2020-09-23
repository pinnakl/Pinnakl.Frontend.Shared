import { Injectable } from '@angular/core';

import { interval, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { EventSourceService, UserService, WebServiceProvider } from '@pnkl-frontend/core';
import { environment } from '../../../../environments';
import { DashboardMarketMacroStatFromApi } from './dashboard-market-macro-stat-from-api.model';
import { DashboardMarketMacroStat } from './dashboard-market-macro-stat.model';

const USE_MOCK = !environment.production && false;

@Injectable()
export class DashboardMarketMacroStatService {
  private readonly RESOURCE_URL = 'dashboard_market_macro_stats';
  private readonly EVENT_TYPE = 'message';
  private readonly EVENT_SOURCE_RESOURCE_URL = `${
    environment.sseAppUrl
  }MacroStatNotification/Subscribe`;

  constructor(
    private eventSourceService: EventSourceService,
    private userService: UserService,
    private wsp: WebServiceProvider
  ) {}

  async getAll(): Promise<DashboardMarketMacroStat[]> {
    const entitiesFromApi: DashboardMarketMacroStatFromApi[] = await this.wsp.get(
      { endPoint: this.RESOURCE_URL }
    );
    // const entities = entitiesFromApi.map(formatEntity);
    const entities = mockDataFromApi.map(formatEntity);
    return entities;
  }

  subscribe(): Observable<DashboardMarketMacroStat[]> {
    let sseUrl = `${this.EVENT_SOURCE_RESOURCE_URL}?usertoken=${
      this.userService.getUser().token
    }`;
    // TODO : Comment below line, only needed for prod sse testing
    // sseUrl =
    //   'https://server.pinnakl.com/PnklSSE/api/MacroStatNotification/Subscribe?usertoken=CDFA8EE56AD726CC73EF56005092D348';
    return USE_MOCK
      ? createMockStream()
      : this.eventSourceService
          .create<DashboardMarketMacroStatFromApi[]>({
            eventType: this.EVENT_TYPE,
            url: sseUrl
          })
          .pipe(map(x => x.map(formatEntity)));
  }
}

function formatEntity({
  PctChange,
  MacroDescription,
  Type,
  Value
}: DashboardMarketMacroStatFromApi): DashboardMarketMacroStat {
  return {
    change: Type === 'index' ? +PctChange : null,
    name: MacroDescription,
    type: <any>Type,
    value: +Value
  };
}

function createMacroStats(): DashboardMarketMacroStat[] {
  return [
    {
      change: 1.1,
      name: 'Dow Jones',
      type: 'index',
      value: 11.1111
    },
    {
      change: -2.2,
      name: 'S&P 500',
      type: 'index',
      value: -22.2222
    },
    {
      change: 3.3,
      name: 'Russell 2000',
      type: 'index',
      value: 33.3333
    },
    {
      change: -4.4,
      name: '10-Yr Treasury',
      type: 'macrostat',
      value: -44.4444
    },
    {
      change: 5.5,
      name: '30-Yr Treasury',
      type: 'macrostat',
      value: 55.5555
    },
    {
      change: -6.6,
      name: 'Mortgage Rate 30-Yr',
      type: 'macrostat',
      value: -66.6666
    },
    {
      change: 7.7,
      name: 'Fed Funds',
      type: 'macrostat',
      value: 77.7777
    }
  ];
}

function createMockStream(): Observable<DashboardMarketMacroStat[]> {
  return interval(200).pipe(map(() => createRandomStats()));
}

function createRandomStats(): DashboardMarketMacroStat[] {
  return createMacroStats().map(stat => {
    const randomNumberEven = Math.floor(Math.random() * 100) % 2 === 0;
    const multiplier = randomNumberEven ? -1 : 1;
    return {
      ...stat,
      change: Math.random() * 10 * multiplier,
      value: Math.random() * 100
    };
  });
}

const mockDataFromApi: DashboardMarketMacroStatFromApi[] = [
  {
    MacroCode: 'dgs1mo',
    MacroDescription: '1-Mo Treasury',
    Type: 'macro',
    Value: '0',
    PctChange: null
  },
  {
    MacroCode: 'dgs10',
    MacroDescription: '10-Yr Treasury',
    Type: 'macro',
    Value: '0',
    PctChange: null
  },
  {
    MacroCode: 'dgs30',
    MacroDescription: '30-Yr Treasury',
    Type: 'macro',
    Value: '0',
    PctChange: null
  },
  {
    MacroCode: 'mortgage30us',
    MacroDescription: '30-Yr Mortgage Rate',
    Type: 'macro',
    Value: '0',
    PctChange: null
  },
  {
    MacroCode: 'fedfunds',
    MacroDescription: 'Fed Funds',
    Type: 'macro',
    Value: '0',
    PctChange: null
  },
  {
    MacroCode: 'SPY',
    MacroDescription: 'S&P 500',
    Type: 'index',
    Value: '0',
    PctChange: '0'
  },
  {
    MacroCode: 'DIA',
    MacroDescription: 'Dow Jones',
    Type: 'index',
    Value: '0',
    PctChange: '0'
  },
  {
    MacroCode: 'QQQ',
    MacroDescription: 'Nasdaq',
    Type: 'index',
    Value: '0',
    PctChange: '0'
  },
  {
    MacroCode: 'IWM',
    MacroDescription: 'Russell 2000',
    Type: 'index',
    Value: '0',
    PctChange: '0'
  }
];
