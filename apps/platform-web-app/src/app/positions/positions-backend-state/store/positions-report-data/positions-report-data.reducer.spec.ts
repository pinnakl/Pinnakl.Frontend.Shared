import { PositionsReportDataFilter } from './positions-report-data-filter.model';
import {
  AddManyPositionsReportData,
  AddPositionsReportData,
  AttemptLoadPositionsReportData,
  LoadPositionsReportData,
  LoadPositionsReportDataFailed,
  UpdateManyPositionsReportData,
  UpdatePositionsReportData
} from './positions-report-data.actions';
import { initialState, reducer } from './positions-report-data.reducer';

describe('PositionsReportData Reducer', () => {
  const reportDataFilter: PositionsReportDataFilter = {
    id: 31,
    params: [
      {
        caption: 'As of Date',
        defaultValue: 'today',
        id: 28,
        name: 'posdate',
        required: true,
        type: 'date',
        value: '2018-11-30T13:17:01.859Z'
      }
    ],
    reportingColumns: [
      {
        dbId: 1015,
        convertToBaseCurrency: undefined,
        caption: 'AccountCode',
        name: 'AccountCode',
        reportingColumnType: 'report',
        type: 'text',
        decimalPlaces: null,
        filters: null,
        groupOrder: null,
        include: true,
        isAggregating: false,
        renderingFunction: 'NULL',
        sortAscending: null,
        formula: null,
        sortOrder: null,
        viewOrder: 15
      },
      {
        dbId: 1013,
        convertToBaseCurrency: undefined,
        caption: 'Analyst',
        name: 'Analyst',
        reportingColumnType: 'report',
        type: 'text',
        decimalPlaces: null,
        filters: null,
        groupOrder: null,
        formula: null,
        include: true,
        isAggregating: false,
        renderingFunction: 'NULL',
        sortAscending: null,
        sortOrder: null,
        viewOrder: 13
      },
      {
        dbId: 1003,
        convertToBaseCurrency: undefined,
        caption: 'AssetType',
        name: 'AssetType',
        reportingColumnType: 'report',
        type: 'text',
        decimalPlaces: null,
        filters: null,
        groupOrder: null,
        formula: null,
        include: true,
        isAggregating: false,
        renderingFunction: 'NULL',
        sortAscending: null,
        sortOrder: null,
        viewOrder: 3
      }
    ]
  };
  const reportData: any[] = [
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
    }
  ];

  const reportDataRow = {
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
  };

  const reportDataToUpdate = {
    Strategy: 'COR',
    FolderCode: 'AFGR',
    AccountId: 1,
    CustomAttributeId: 3312,
    SecurityId: 1426,
    MVLocal: 4026677.745667,
    LMVLocal: 4026677.745667,
    Mtd_Pnl: 4000
  };

  describe('AddManyPositionsReportData action', () => {
    it('should add new rows in positions report data', () => {
      const action = new LoadPositionsReportData({
        positionsReportData: reportData
      });

      let result = reducer(initialState, action);

      const addAction = new AddManyPositionsReportData({
        reportDataToAdd: [reportDataRow, { ...reportDataRow, SecurityId: 111 }]
      });

      result = reducer(result, addAction);

      expect(result).toEqual({
        loaded: true,
        loading: false,
        reportData: [
          ...reportData,
          reportDataRow,
          { ...reportDataRow, SecurityId: 111 }
        ]
      });
    });
  });

  describe('AddPositionsReportData action', () => {
    it('should add new row in positions report data', () => {
      const action = new LoadPositionsReportData({
        positionsReportData: reportData
      });

      let result = reducer(initialState, action);

      const addAction = new AddPositionsReportData({
        reportDataToAdd: reportDataRow
      });

      result = reducer(result, addAction);

      expect(result).toEqual({
        loaded: true,
        loading: false,
        reportData: [...reportData, reportDataRow]
      });
    });
  });

  describe('AttemptLoadPositionReportData action', () => {
    it('should set loading true and loaded false', () => {
      const action = new AttemptLoadPositionsReportData(reportDataFilter);

      const result = reducer(initialState, action);

      expect(result).toEqual({ ...initialState, loaded: false, loading: true });
    });
  });

  describe('LoadPositionReportData action', () => {
    it('should populate state with reporting data and set loaded true and loading false', () => {
      const action = new LoadPositionsReportData({
        positionsReportData: reportData
      });

      const result = reducer(initialState, action);

      expect(result).toEqual({ loaded: true, loading: false, reportData });
    });
  });

  describe('LoadPositionReportDataFailed action', () => {
    it('should set loading false and loaded false', () => {
      const error = 'Test Error',
        action = new LoadPositionsReportDataFailed({ error });

      const result = reducer(initialState, action);

      expect(result).toEqual({
        ...initialState,
        loaded: false,
        loading: false
      });
    });
  });

  describe('UpdatePositionsReportData action', () => {
    it('should update data in positions report data', () => {
      const action = new LoadPositionsReportData({
        positionsReportData: reportData
      });
      let result = reducer(initialState, action);
      const updateAction = new UpdatePositionsReportData({
        reportDataToUpdate
      });
      result = reducer(result, updateAction);

      expect(result).toEqual({
        loaded: true,
        loading: false,
        reportData: [
          ...reportData.slice(1),
          { ...reportData[0], ...reportDataToUpdate }
        ]
      });
    });
  });
  describe('UpdateManyPositionsReportData action', () => {
    it('should update data in positions report data', () => {
      const action = new LoadPositionsReportData({
        positionsReportData: reportData
      });
      let result = reducer(initialState, action);
      const updateAction = new UpdateManyPositionsReportData({
        reportDataToUpdate: [
          reportDataToUpdate,
          { ...reportDataToUpdate, AccountId: 2 }
        ]
      });
      result = reducer(result, updateAction);

      expect(result).toEqual({
        loaded: true,
        loading: false,
        reportData: [
          { ...reportData[0], ...reportDataToUpdate },
          { ...reportData[1], ...{ ...reportDataToUpdate, AccountId: 2 } },
          ...reportData.slice(2)
        ]
      });
    });
  });
});
