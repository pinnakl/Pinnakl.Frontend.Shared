import { DatePipe, DecimalPipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { Store, StoreModule } from '@ngrx/store';
import { ReportingHelper } from '@pnkl-frontend/reporting';

import { ReportingColumn } from '@pnkl-frontend/shared';
import {
  reducers as backendStateReducers
} from '../positions-backend-state';
import { LoadPositionsReportData } from '../positions-backend-state/store/positions-report-data/positions-report-data.actions';
import { PositionsUiStateFacade } from './positions-ui-state-facade.service';
import {
  reducers,
  State
} from './store';
import { LoadPositionsReportSelectedColumns } from './store/positions-report-selected-column/positions-report-selected-column.actions';
import { LoadSelectedCurrency } from './store/selected-currency/selected-currency.actions';

describe('PositionsUiStateFacade - positionsGridData$', () => {
  let facade: PositionsUiStateFacade;
  let store: Store<State>;
  const result: any[] = [];

  const reportingHelper = {
    getFilterString: () => {}
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature('positionsBackend', backendStateReducers),
        StoreModule.forFeature('positionsUi', reducers)
      ],
      providers: [
        DatePipe,
        DecimalPipe,
        PositionsUiStateFacade,
        { provide: ReportingHelper, useValue: reportingHelper }
      ]
    });
    facade = TestBed.inject(PositionsUiStateFacade);
    store = TestBed.inject(Store);
    store.dispatch(
      LoadPositionsReportData({
        positionsReportData: masterData
      })
    );
    // facade.positionsGridData$.subscribe(x => (result = x));
  });

  describe('positionsGridAggregations$', () => {
    it('should return the grid aggregations', () => {
      let aggregationResult: any[];
      facade.positionsGridAggregations$.subscribe(x => (aggregationResult = x));
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            {
              name: 'AccountCode',
              filters: ['CMST'],
              include: true
            } as ReportingColumn,
            {
              name: 'Position',
              include: true,
              isAggregating: true,
              type: 'numeric'
            } as ReportingColumn
          ]
        })
      );
      expect(aggregationResult).toEqual([
        {
          AccountCode: '',
          Position: '6,200,205.94'
        }
      ]);
    });

    it('should return the grid aggregations for pnl fields', () => {
      let aggregationResult: any[];
      facade.positionsGridAggregations$.subscribe(x => (aggregationResult = x));
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            {
              name: 'pnlRealized',
              include: true,
              isAggregating: true,
              type: 'numeric'
            } as ReportingColumn,
            {
              name: 'pnlUnRealized',
              include: true,
              isAggregating: true,
              type: 'numeric'
            } as ReportingColumn
          ]
        })
      );
      expect(aggregationResult).toEqual([
        {
          pnlRealized: '4',
          pnlUnRealized: '7'
        }
      ]);
    });
  });

  describe('selection', () => {
    it('should return no data if no columns are selected', () => {
      expect(result).toEqual([]);
    });
    it('should return data with only the selected columns', () => {
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            { name: 'Strategy', include: true } as ReportingColumn,
            { name: 'FolderCode', include: true } as ReportingColumn
          ]
        })
      );
      expect(result).toEqual([
        { Strategy: 'COR', FolderCode: 'AFGR' },
        { Strategy: 'COR', FolderCode: 'AFGR' },
        { Strategy: 'COR', FolderCode: 'AFGR' },
        { Strategy: 'COR', FolderCode: 'BOARD' },
        { Strategy: 'COR', FolderCode: 'BOARD' }
      ]);
    });
    it('should return data with only the selected columns includeing pnl fields', () => {
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            { name: 'Strategy', include: true } as ReportingColumn,
            { name: 'FolderCode', include: true } as ReportingColumn,
            { name: 'pnlRealized', include: true } as ReportingColumn
          ]
        })
      );
      expect(result).toEqual([
        { Strategy: 'COR', FolderCode: 'AFGR', pnlRealized: 2 },
        { Strategy: 'COR', FolderCode: 'AFGR', pnlRealized: 3 },
        { Strategy: 'COR', FolderCode: 'AFGR', pnlRealized: 1 },
        { Strategy: 'COR', FolderCode: 'BOARD', pnlRealized: 0 },
        { Strategy: 'COR', FolderCode: 'BOARD', pnlRealized: -2 }
      ]);
    });
    it('should omit the columns which have the include property set to false', () => {
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            { name: 'Strategy', include: true } as ReportingColumn,
            { name: 'FolderCode', include: true } as ReportingColumn,
            { name: 'AssetType', include: false } as ReportingColumn
          ]
        })
      );
      expect(result).toEqual([
        { Strategy: 'COR', FolderCode: 'AFGR' },
        { Strategy: 'COR', FolderCode: 'AFGR' },
        { Strategy: 'COR', FolderCode: 'AFGR' },
        { Strategy: 'COR', FolderCode: 'BOARD' },
        { Strategy: 'COR', FolderCode: 'BOARD' }
      ]);
    });
  });
  describe('filtering', () => {
    it('should filter the result using the column filters', () => {
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            { name: 'Strategy', include: true } as ReportingColumn,
            { name: 'Description', include: true } as ReportingColumn,
            {
              name: 'AccountCode',
              include: true,
              filters: ['CMST', 'PCH']
            } as ReportingColumn,
            {
              name: 'Ticker',
              include: false,
              filters: ['AFFI']
            } as ReportingColumn
          ]
        })
      );
      expect(result).toEqual([
        {
          Strategy: 'COR',
          Description: 'Affinion TL 1L "NEW" -',
          AccountCode: 'CMST'
        },
        {
          Strategy: 'COR',
          Description: 'Affinion TL 1L "NEW" -',
          AccountCode: 'PCH'
        }
      ]);
    });
  });
  describe('aggregation', () => {
    it('should return fewer rows with aggregated results if aggregating columns are included', () => {
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            {
              name: 'AccountCode',
              filters: ['CMST', 'PCH'],
              include: true
            } as ReportingColumn,
            {
              name: 'Position',
              include: true,
              isAggregating: true,
              type: 'numeric'
            } as ReportingColumn
          ]
        })
      );
      expect(result).toEqual([
        {
          AccountCode: 'CMST',
          Position: 3968812.46 + 2231393.48
        },
        {
          AccountCode: 'PCH',
          Position: 3711564.88 + 2056320.81
        }
      ]);
    });

    it('should return fewer rows with aggregated results(including pnl fields) if aggregating columns are included', () => {
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            {
              name: 'AccountCode',
              filters: ['CMST', 'PCH'],
              include: true
            } as ReportingColumn,
            {
              name: 'Position',
              include: true,
              isAggregating: true,
              type: 'numeric'
            } as ReportingColumn,
            {
              name: 'pnlUnRealized',
              include: true,
              isAggregating: true,
              type: 'numeric'
            } as ReportingColumn
          ]
        })
      );
      expect(result).toEqual([
        {
          AccountCode: 'CMST',
          Position: 3968812.46 + 2231393.48,
          pnlUnRealized: 2 + 0
        },
        {
          AccountCode: 'PCH',
          Position: 3711564.88 + 2056320.81,
          pnlUnRealized: 3 + 1
        }
      ]);
    });
  });
  describe('fxRate', () => {
    it('should return the values multiplied by fxRate for the required columns if fx rate is selected', () => {
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            {
              name: 'AccountCode',
              filters: ['CMST', 'PCH'],
              include: true
            } as ReportingColumn,
            {
              convertToBaseCurrency: true,
              name: 'MVLocal',
              include: true,
              isAggregating: true,
              type: 'numeric'
            } as ReportingColumn
          ]
        })
      );
      store.dispatch(
        LoadSelectedCurrency({
          payload: { currencyId: 1, fxRate: 1.5 }
        })
      );
      expect(result).toEqual([
        {
          AccountCode: 'CMST',
          MVLocal: (4026677.745667 + 2268590.809312) * 1.5
        },
        {
          AccountCode: 'PCH',
          MVLocal: (3765679.49595 + 2090599.677903) * 1.5
        }
      ]);
    });
    it('should not multiply by fx rate if no fx rate is selected', () => {
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            {
              name: 'AccountCode',
              filters: ['CMST', 'PCH'],
              include: true
            } as ReportingColumn,
            {
              convertToBaseCurrency: true,
              name: 'MVLocal',
              include: true,
              isAggregating: true,
              type: 'numeric'
            } as ReportingColumn
          ]
        })
      );
      expect(result).toEqual([
        {
          AccountCode: 'CMST',
          MVLocal: 4026677.745667 + 2268590.809312
        },
        {
          AccountCode: 'PCH',
          MVLocal: 3765679.49595 + 2090599.677903
        }
      ]);
    });
  });
});

const masterData = [
  {
    Strategy: 'COR',
    FolderCode: 'AFGR',
    AccountId: 1,
    CustomAttributeId: 3312,
    AssetType: 'BANKDEBT',
    Identifier: '00826BAD9',
    Ticker: 'AFFI',
    Cusip: '00826BAD9',
    Isin: '',
    Sedol: '',
    LoanId: 'BL2407536',
    Description: 'Affinion TL 1L "NEW" -',
    AccountCode: 'CMST',
    Sector: 'COMMUNICATIONS',
    Trader: 'KC',
    Analyst: 'KB',
    OrgTicker: 'AFFI',
    SandPRating: 'CCC+',
    MoodyRating: '',
    Coupon: 9.5,
    Maturity: '2022-04-02T18:30:00.000Z',
    PriceLocal: 101.458,
    SecurityId: 1426,
    LocalCurrency: 'USD',
    Position: 3968812.46,
    MVUSD: 4026677.745667,
    MVUSDPct: 0,
    LMVUSD: 4026677.745667,
    LMVUSDPCT: 376.275433690459,
    SMVUSD: 0,
    SMVUSDPCT: 0,
    MVLocal: 4026677.745667,
    LMVLocal: 4026677.745667,
    SMVLocal: 0,
    Mtd_Pnl: 2838.75,
    Ytd_Pnl: 213906.22,
    'Internal Rating': '',
    'Credit Attribution': '40',
    'Rho Attribution': '0',
    'Recovery Rate': '70',
    Spread: '8.75',
    'Aggregation Symbol': 'AFFI',
    Liquidity_Days: '',
    A1: ''
  },
  {
    Strategy: 'COR',
    FolderCode: 'AFGR',
    AccountId: 2,
    CustomAttributeId: 3312,
    AssetType: 'BANKDEBT',
    Identifier: '00826BAD9',
    Ticker: 'AFFI',
    Cusip: '00826BAD9',
    Isin: '',
    Sedol: '',
    LoanId: 'BL2407536',
    Description: 'Affinion TL 1L "NEW" -',
    AccountCode: 'PCH',
    Sector: 'COMMUNICATIONS',
    Trader: 'KC',
    Analyst: 'KB',
    OrgTicker: 'AFFI',
    SandPRating: 'CCC+',
    MoodyRating: '',
    Coupon: 9.5,
    Maturity: '2022-04-02T18:30:00.000Z',
    PriceLocal: 101.458,
    SecurityId: 1426,
    LocalCurrency: 'USD',
    Position: 3711564.88,
    MVUSD: 3765679.49595,
    MVUSDPct: 0,
    LMVUSD: 3765679.49595,
    LMVUSDPCT: 255.449217797317,
    SMVUSD: 0,
    SMVUSDPCT: 0,
    MVLocal: 3765679.49595,
    LMVLocal: 3765679.49595,
    SMVLocal: 0,
    Mtd_Pnl: null,
    Ytd_Pnl: null,
    'Internal Rating': '',
    'Credit Attribution': '40',
    'Rho Attribution': '0',
    'Recovery Rate': '70',
    Spread: '8.75',
    'Aggregation Symbol': 'AFFI',
    Liquidity_Days: '',
    A1: ''
  },
  {
    Strategy: 'COR',
    FolderCode: 'AFGR',
    AccountId: 8,
    CustomAttributeId: 3312,
    AssetType: 'BANKDEBT',
    Identifier: '00826BAD9',
    Ticker: 'AFFI',
    Cusip: '00826BAD9',
    Isin: '',
    Sedol: '',
    LoanId: 'BL2407536',
    Description: 'Affinion TL 1L "NEW" -',
    AccountCode: 'NPB',
    Sector: 'COMMUNICATIONS',
    Trader: 'KC',
    Analyst: 'KB',
    OrgTicker: 'AFFI',
    SandPRating: 'CCC+',
    MoodyRating: '',
    Coupon: 9.5,
    Maturity: '2022-04-02T18:30:00.000Z',
    PriceLocal: 101.458,
    SecurityId: 1426,
    LocalCurrency: 'USD',
    Position: 682090.16,
    MVUSD: 692035.034533,
    MVUSDPct: 0,
    LMVUSD: 692035.034533,
    LMVUSDPCT: 207.414239968509,
    SMVUSD: 0,
    SMVUSDPCT: 0,
    MVLocal: 692035.034533,
    LMVLocal: 692035.034533,
    SMVLocal: 0,
    Mtd_Pnl: null,
    Ytd_Pnl: null,
    'Internal Rating': '',
    'Credit Attribution': '40',
    'Rho Attribution': '0',
    'Recovery Rate': '70',
    Spread: '8.75',
    'Aggregation Symbol': 'AFFI',
    Liquidity_Days: '',
    A1: ''
  },
  {
    Strategy: 'COR',
    FolderCode: 'BOARD',
    AccountId: 1,
    CustomAttributeId: 3773,
    AssetType: 'BANKDEBT',
    Identifier: '09660JAB6',
    Ticker: 'BRDRID',
    Cusip: '09660JAB6',
    Isin: '',
    Sedol: '',
    LoanId: 'BL2641811',
    Description: 'BOARDRIDERS INC TL B 1L 8.75% 4/6/24',
    AccountCode: 'CMST',
    Sector: 'CONSUMER, CYCLICAL',
    Trader: 'KC',
    Analyst: 'KC',
    OrgTicker: 'BRDRID',
    SandPRating: '',
    MoodyRating: '',
    Coupon: 8.75,
    Maturity: '2024-04-05T18:30:00.000Z',
    PriceLocal: 101.667,
    SecurityId: 1914,
    LocalCurrency: 'USD',
    Position: 2231393.48,
    MVUSD: 2268590.809312,
    MVUSDPct: 0,
    LMVUSD: 2268590.809312,
    LMVUSDPCT: 211.989894537404,
    SMVUSD: 0,
    SMVUSDPCT: 0,
    MVLocal: 2268590.809312,
    LMVLocal: 2268590.809312,
    SMVLocal: 0,
    Mtd_Pnl: null,
    Ytd_Pnl: null,
    'Internal Rating': '',
    'Credit Attribution': '',
    'Rho Attribution': '',
    'Recovery Rate': '',
    Spread: '',
    'Aggregation Symbol': '',
    Liquidity_Days: '',
    A1: ''
  },
  {
    Strategy: 'COR',
    FolderCode: 'BOARD',
    AccountId: 2,
    CustomAttributeId: 3773,
    AssetType: 'BANKDEBT',
    Identifier: '09660JAB6',
    Ticker: 'BRDRID',
    Cusip: '09660JAB6',
    Isin: '',
    Sedol: '',
    LoanId: 'BL2641811',
    Description: 'BOARDRIDERS INC TL B 1L 8.75% 4/6/24',
    AccountCode: 'PCH',
    Sector: 'CONSUMER, CYCLICAL',
    Trader: 'KC',
    Analyst: 'KC',
    OrgTicker: 'BRDRID',
    SandPRating: '',
    MoodyRating: '',
    Coupon: 8.75,
    Maturity: '2024-04-05T18:30:00.000Z',
    PriceLocal: 101.667,
    SecurityId: 1914,
    LocalCurrency: 'USD',
    Position: 2056320.81,
    MVUSD: 2090599.677903,
    MVUSDPct: 0,
    LMVUSD: 2090599.677903,
    LMVUSDPCT: 141.818243698649,
    SMVUSD: 0,
    SMVUSDPCT: 0,
    MVLocal: 2090599.677903,
    LMVLocal: 2090599.677903,
    SMVLocal: 0,
    Mtd_Pnl: null,
    Ytd_Pnl: null,
    'Internal Rating': '',
    'Credit Attribution': '',
    'Rho Attribution': '',
    'Recovery Rate': '',
    Spread: '',
    'Aggregation Symbol': '',
    Liquidity_Days: '',
    A1: ''
  }
];
