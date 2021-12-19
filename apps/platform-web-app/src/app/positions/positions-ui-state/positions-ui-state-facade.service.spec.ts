import { DatePipe, DecimalPipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { Store, StoreModule } from '@ngrx/store';
import { ReportingHelper } from '@pnkl-frontend/reporting';

import {
  AgPeekTextComponent,
  PinnaklColDef
} from '@pnkl-frontend/shared';
import {
  CustomAttribute,
  IdcColumn,
  ReportColumn,
  ReportingColumn,
  ReportParameter
} from '@pnkl-frontend/shared';
import {
  reducers as backendStateReducers
} from '../positions-backend-state';
import { LoadCustomAttributes } from '../positions-backend-state/store/custom-attribute/custom-attribute.actions';
import { LoadIdcColumns } from '../positions-backend-state/store/idc-column/idc-column.actions';
import { LoadPositionsReportData } from '../positions-backend-state/store/positions-report-data/positions-report-data.actions';
import { LoadReportColumns } from '../positions-backend-state/store/report-column/report-column.actions';
import { LoadReportParameters } from '../positions-backend-state/store/report-parameter/report-parameter.actions';
import { PositionsUiStateFacade } from './positions-ui-state-facade.service';
import {
  reducers,
  State
} from './store';
import { LoadPositionsReportParameterValues } from './store/positions-report-parameter-value/positions-report-parameter-value.actions';
import { PositionsReportParameterValue } from './store/positions-report-parameter-value/positions-report-parameter-value.model';
import {
  AddPositionsReportSelectedColumns,
  DeletePositionsReportSelectedColumns,
  LoadPositionsReportSelectedColumns
} from './store/positions-report-selected-column/positions-report-selected-column.actions';

const customAttribute1: CustomAttribute = {
  id: 4,
  listOptions: null,
  name: 'Internal Rating',
  type: 'text'
};
const customAttribute2: CustomAttribute = {
  id: 5,
  listOptions: null,
  name: 'AA',
  type: 'number'
};

const reportColumn1: ReportColumn = {
  caption: 'Asset Type',
  convertToBaseCurrency: true,
  decimalPlaces: 0,
  filterValues: ['BOND'],
  groupOrder: 1,
  id: 55,
  isAggregating: true,
  name: 'AssetType',
  renderingFunction: '',
  reportId: 7,
  sortAscending: false,
  sortOrder: 1,
  type: 'text',
  viewOrder: 2,
  formula: null
};

const reportColumn2: ReportColumn = {
  caption: 'Sector',
  convertToBaseCurrency: false,
  decimalPlaces: 0,
  filterValues: ['TECHNOLOGY'],
  groupOrder: 2,
  id: 56,
  isAggregating: false,
  name: 'Sector',
  renderingFunction: '',
  reportId: 7,
  sortAscending: true,
  sortOrder: 2,
  type: 'text',
  formula: null,
  viewOrder: 3
};

const rcReportingColumn1: ReportingColumn = {
  caption: 'Asset Type',
  convertToBaseCurrency: true,
  dbId: 55,
  decimalPlaces: 0,
  filters: ['BOND'],
  groupOrder: 1,
  include: true,
  isAggregating: true,
  name: 'AssetType',
  renderingFunction: '',
  sortAscending: false,
  sortOrder: 1,
  type: 'text',
  viewOrder: 2,
  formula: null,
  reportingColumnType: 'report'
};
const rcReportingColumn2: ReportingColumn = {
  caption: 'Sector',
  convertToBaseCurrency: false,
  dbId: 56,
  decimalPlaces: 0,
  filters: ['TECHNOLOGY'],
  groupOrder: 2,
  include: true,
  isAggregating: false,
  name: 'Sector',
  renderingFunction: '',
  sortAscending: true,
  sortOrder: 2,
  type: 'text',
  viewOrder: 3,
  formula: null,
  reportingColumnType: 'report'
};
const caReportingColumn1: ReportingColumn = {
  caption: 'Internal Rating',
  convertToBaseCurrency: false,
  dbId: 4,
  decimalPlaces: null,
  filters: null,
  groupOrder: null,
  include: true,
  isAggregating: false,
  name: 'Internal Rating',
  renderingFunction: null,
  sortAscending: null,
  sortOrder: null,
  type: 'text',
  viewOrder: null,
  formula: null,
  reportingColumnType: 'ca'
};
const caReportingColumn2: ReportingColumn = {
  caption: 'AA',
  convertToBaseCurrency: false,
  dbId: 5,
  decimalPlaces: null,
  filters: null,
  groupOrder: null,
  include: true,
  isAggregating: false,
  name: 'AA',
  renderingFunction: null,
  sortAscending: null,
  sortOrder: null,
  type: 'number',
  viewOrder: null,
  formula: null,
  reportingColumnType: 'ca'
};
const idcColumn: IdcColumn = {
  id: 1,
  idcColumnName: 'a.b.c',
  pnklColumnName: 'a.b.c'
};
const idcColumns = [idcColumn];
const idcReportingColumn1 = { reportingColumnType: 'idc' } as ReportingColumn;

const reportParameter1: ReportParameter = {
  caption: 'As Of Date',
  defaultValue: 'today',
  id: 6,
  name: 'asOfDate',
  required: true,
  type: 'date',
  value: new Date('01/01/2001')
};
const reportParameters = [reportParameter1];
const positionsReportParameterValue1: PositionsReportParameterValue = {
  id: 6,
  value: new Date('01/01/2002')
};
const positionsReportParameterValues = [positionsReportParameterValue1];
const positionsFilterParameterValue1: ReportParameter = {
  caption: 'As Of Date',
  defaultValue: 'today',
  id: 6,
  name: 'asOfDate',
  required: true,
  type: 'date',
  value: new Date('01/01/2002')
};
const positionsFilterParameterValues = [positionsFilterParameterValue1];

describe('PositionsUiStateFacade', () => {
  let facade: PositionsUiStateFacade;
  let store: Store<State>;

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
  });

  describe('positionsConfigAllIdcColumns$', () => {
    it('should return all the IDC columns', () => {
      let result: IdcColumn[];
      facade.positionsConfigAllIdcColumns$.subscribe(x => (result = x));
      expect(result).toEqual([]);
      store.dispatch(LoadIdcColumns({ idcColumns }));
      expect(result).toEqual(idcColumns);
    });
  });

  describe('positionsConfigAvailableReportColumns$', () => {
    it('should return the available columns', () => {
      let result: ReportingColumn[];
      facade.positionsConfigAvailableReportColumns$.subscribe(
        x => (result = x)
      );
      expect(result).toEqual([]);
      store.dispatch(
        LoadReportColumns({ reportColumns: [reportColumn1, reportColumn2] })
      );
      expect(result).toEqual([rcReportingColumn1, rcReportingColumn2]);
      store.dispatch(
        LoadCustomAttributes({
          customAttributes: [customAttribute1, customAttribute2]
        })
      );
      expect(result).toEqual([
        caReportingColumn2,
        rcReportingColumn1,
        caReportingColumn1,
        rcReportingColumn2
      ]);
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            rcReportingColumn1,
            caReportingColumn1,
            idcReportingColumn1
          ]
        })
      );
      expect(result).toEqual([caReportingColumn2, rcReportingColumn2]);
    });
  });

  describe('positionsConfigSelectedIdcColumns$', () => {
    it('should return the selected idc columns', () => {
      let result: ReportingColumn[];
      facade.positionsConfigSelectedIdcColumns$.subscribe(x => (result = x));
      expect(result).toEqual([]);
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            rcReportingColumn1,
            caReportingColumn2,
            idcReportingColumn1
          ]
        })
      );
      expect(result).toEqual([idcReportingColumn1]);
    });
  });

  describe('positionsConfigSelectedReportColumns$', () => {
    it('should return the selected columns', () => {
      let result: ReportingColumn[];
      facade.positionsConfigSelectedReportColumns$.subscribe(x => (result = x));
      expect(result).toEqual([]);
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            rcReportingColumn1,
            caReportingColumn2,
            idcReportingColumn1
          ]
        })
      );
      expect(result).toEqual([caReportingColumn2, rcReportingColumn1]);
    });
  });

  describe('positionsFilterColumns$', () => {
    it('should return the filter columns', () => {
      let result: (ReportingColumn & { dropdownOptions: string[] })[];
      facade.positionsFilterColumns$.subscribe(x => (result = x));
      expect(result).toEqual([]);
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            rcReportingColumn1,
            caReportingColumn1,
            caReportingColumn2
          ]
        })
      );
      expect(result).toEqual([
        { ...caReportingColumn2, dropdownOptions: [] },
        { ...rcReportingColumn1, dropdownOptions: [] },
        { ...caReportingColumn1, dropdownOptions: [] }
      ]);
      store.dispatch(
        LoadPositionsReportData({
          positionsReportData: [
            {
              AA: 100,
              AssetType: 'X',
              'Internal Rating': '1'
            },
            {
              AA: 100,
              AssetType: 'X',
              'Internal Rating': '2'
            },
            {
              AA: 200,
              AssetType: 'Y',
              'Internal Rating': '2'
            }
          ]
        })
      );
      expect(result).toEqual([
        { ...caReportingColumn2, dropdownOptions: [] },
        { ...rcReportingColumn1, dropdownOptions: ['X', 'Y'] },
        { ...caReportingColumn1, dropdownOptions: ['1', '2'] }
      ]);
    });
  });

  describe('positionsFilterParameterValues$', () => {
    it('should return the filter parameter values', () => {
      let result: ReportParameter[];
      facade.positionsFilterParameterValues$.subscribe(x => (result = x));
      expect(result).toEqual([]);
      store.dispatch(LoadReportParameters({ reportParameters }));
      expect(result).toEqual(reportParameters);
      store.dispatch(
        LoadPositionsReportParameterValues({
          positionsReportParameterValues
        })
      );
      expect(result).toEqual(positionsFilterParameterValues);
    });
  });

  describe('positionsGridColDefs$', () => {
    let result: PinnaklColDef[];
    beforeEach(() => {
      facade.positionsGridColDefs$.subscribe(x => (result = x));
    });
    it('should return the grid colDefs', () => {
      expect(result).toEqual([]);
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            {
              caption: 'Asset Type',
              include: true,
              name: 'AssetType',
              reportingColumnType: 'report'
            } as ReportingColumn,
            {
              caption: 'C',
              include: true,
              name: 'A.B.C',
              reportingColumnType: 'idc'
            } as ReportingColumn
          ]
        })
      );
      expect(result).toEqual([
        {
          enableRowGroup: true,
          field: 'AssetType',
          headerName: 'Asset Type'
        },
        {
          enableRowGroup: true,
          field: 'C',
          headerName: 'C'
        }
      ]);
    });
    it('should hide the unincluded columns', () => {
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            {
              caption: 'Asset Type',
              include: true,
              name: 'AssetType',
              reportingColumnType: 'report'
            } as ReportingColumn,
            {
              caption: 'C',
              include: false,
              name: 'A.B.C',
              reportingColumnType: 'idc'
            } as ReportingColumn
          ]
        })
      );
      expect(result).toEqual([
        {
          enableRowGroup: true,
          field: 'AssetType',
          headerName: 'Asset Type'
        },
        {
          enableRowGroup: true,
          field: 'C',
          headerName: 'C',
          hide: true
        }
      ]);
    });
    it('should sort the columns according to the view order', () => {
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            {
              caption: 'Asset Type',
              include: true,
              name: 'AssetType',
              reportingColumnType: 'report',
              viewOrder: null
            } as ReportingColumn,
            {
              caption: 'Account Code',
              include: true,
              name: 'AccountCode',
              reportingColumnType: 'report'
            } as ReportingColumn,
            {
              caption: 'C',
              include: true,
              name: 'A.B.C',
              reportingColumnType: 'idc',
              viewOrder: 2
            } as ReportingColumn,
            {
              caption: 'Sector',
              include: true,
              name: 'Sector',
              reportingColumnType: 'report',
              viewOrder: 1
            } as ReportingColumn
          ]
        })
      );
      expect(result).toEqual([
        {
          enableRowGroup: true,
          field: 'Sector',
          headerName: 'Sector'
        },
        {
          enableRowGroup: true,
          field: 'C',
          headerName: 'C'
        },
        {
          enableRowGroup: true,
          field: 'AssetType',
          headerName: 'Asset Type'
        },
        {
          enableRowGroup: true,
          field: 'AccountCode',
          headerName: 'Account Code'
        }
      ]);
    });
    it('should add the respective properties according to the column type', () => {
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            {
              caption: 'Maturity',
              include: true,
              name: 'Maturity',
              type: 'date'
            } as ReportingColumn,
            {
              caption: 'Positions',
              include: true,
              name: 'Positions',
              type: 'numeric'
            } as ReportingColumn,
            {
              caption: 'MVUSD',
              include: true,
              name: 'MVUSD',
              type: 'currency'
            } as ReportingColumn,
            {
              caption: 'Is Internal',
              include: true,
              name: 'IsInternal',
              type: 'boolean'
            } as ReportingColumn,
            {
              caption: 'Is Internal Custom',
              include: true,
              name: 'IsInternalCustom',
              type: 'custom'
            } as ReportingColumn,
            {
              caption: 'Notes',
              include: true,
              name: 'Notes',
              type: 'longText'
            } as ReportingColumn
          ]
        })
      );
      expect(result).toEqual([
        {
          enableRowGroup: true,
          field: 'Maturity',
          filter: 'date',
          headerName: 'Maturity',
          valueFormatter: jasmine.any(Function)
        },
        {
          cellStyle: { 'text-align': 'right' },
          enableRowGroup: true,
          filter: 'number',
          field: 'Positions',
          headerName: 'Positions',
          valueFormatter: jasmine.any(Function)
        },
        {
          cellStyle: { 'text-align': 'right' },
          enableRowGroup: true,
          filter: 'number',
          field: 'MVUSD',
          headerName: 'MVUSD',
          valueFormatter: jasmine.any(Function)
        },
        {
          cellRenderer: jasmine.any(Function),
          enableRowGroup: true,
          field: 'IsInternal',
          headerName: 'Is Internal'
        },
        {
          cellRenderer: jasmine.any(Function),
          enableRowGroup: true,
          field: 'IsInternalCustom',
          headerName: 'Is Internal Custom'
        },
        {
          autoHeight: true,
          cellRendererFramework: AgPeekTextComponent,
          cellStyle: {
            'white-space': 'pre-line',
            'word-wrap': 'break-word'
          },
          customType: 'LongText',
          enableRowGroup: true,
          field: 'Notes',
          headerName: 'Notes'
        }
      ]);
    });
    it('should handle grouping', () => {
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            {
              caption: 'Asset Type',
              groupOrder: 1,
              include: true,
              name: 'AssetType'
            } as ReportingColumn,
            {
              caption: 'Sector',
              groupOrder: 2,
              include: true,
              name: 'Sector'
            } as ReportingColumn
          ]
        })
      );
      expect(result).toEqual([
        {
          enableRowGroup: true,
          field: 'AssetType',
          headerName: 'Asset Type',
          hide: true,
          rowGroupIndex: 1
        },
        {
          enableRowGroup: true,
          field: 'Sector',
          hide: true,
          headerName: 'Sector',
          rowGroupIndex: 2
        }
      ]);
    });
    it('should handle sorting', () => {
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            {
              caption: 'Asset Type',
              include: true,
              name: 'AssetType',
              sortAscending: true,
              sortOrder: 2
            } as ReportingColumn,
            {
              caption: 'Sector',
              include: true,
              name: 'Sector',
              sortAscending: false,
              sortOrder: 1
            } as ReportingColumn
          ]
        })
      );
      expect(result).toEqual([
        {
          enableRowGroup: true,
          field: 'AssetType',
          headerName: 'Asset Type',
          sort: 'asc',
          sortedAt: 2
        },
        {
          enableRowGroup: true,
          field: 'Sector',
          headerName: 'Sector',
          sort: 'desc',
          sortedAt: 1
        }
      ]);
    });
    it('should handle aggregation', () => {
      store.dispatch(
        LoadPositionsReportSelectedColumns({
          positionsReportSelectedColumns: [
            {
              caption: 'Asset Type',
              include: true,
              name: 'AssetType',
              reportingColumnType: 'report'
            } as ReportingColumn,
            {
              caption: 'Positions',
              include: true,
              isAggregating: true,
              name: 'Positions'
            } as ReportingColumn
          ]
        })
      );
      expect(result).toEqual([
        {
          enableRowGroup: true,
          field: 'AssetType',
          headerName: 'Asset Type'
        },
        {
          aggFunc: 'sum',
          enableRowGroup: true,
          field: 'Positions',
          headerName: 'Positions',
          pinnedRowCellRenderer: jasmine.any(Function)
        }
      ]);
    });
  });

  describe('selectColumns', () => {
    it('should dispatch the addColumns action', () => {
      spyOn(store, 'dispatch').and.callThrough();
      const columns = [rcReportingColumn1, rcReportingColumn2];
      facade.selectColumns(columns);
      expect(store.dispatch).toHaveBeenCalledWith(
        AddPositionsReportSelectedColumns({
          positionsReportSelectedColumns: columns
        })
      );
    });
  });

  describe('unselectColumns', () => {
    it('should dispatch the deleteColumns action', () => {
      spyOn(store, 'dispatch').and.callThrough();
      const columns = [rcReportingColumn1, rcReportingColumn2];
      facade.unselectColumns(columns);
      expect(store.dispatch).toHaveBeenCalledWith(
        DeletePositionsReportSelectedColumns({payload: { positionsReportSelectedColumns: columns }})
      );
    });
  });
});
