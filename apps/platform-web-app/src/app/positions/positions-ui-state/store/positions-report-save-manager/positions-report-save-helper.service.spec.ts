import { TestBed } from '@angular/core/testing';

import { User, UserService } from '@pnkl-frontend/core';
import {
  ClientReportColumn,
  ReportingColumn,
  UserReport,
  UserReportColumn,
  UserReportCustomAttribute,
  UserReportIdcColumn
} from '@pnkl-frontend/shared';
import {
  UserReportColumnService,
  UserReportCustomAttributeService,
  UserReportIdcColumnService,
  UserReportService
} from '@pnkl-frontend/shared';
import { PositionsReportSaveHelper } from './positions-report-save-helper.service';

describe('PositionsReportSaveHelper', () => {
  let service: PositionsReportSaveHelper;
  let userReportColumnService: UserReportColumnService;
  let userReportCustomAttributeService: UserReportCustomAttributeService;
  let userReportIdcColumnService: UserReportIdcColumnService;
  let userReportService: UserReportService;
  let userService: UserService;

  const userId = 4;
  const userReportColumnServiceMock = {
    deleteUserReportColumn(): void {},
    postUserReportColumn(): void {},
    putUserReportColumn(): void {}
  };
  const userReportCustomAttributeServiceMock = {
    deleteUserReportCustomAttribute(): void {},
    postUserReportCustomAttribute(): void {},
    putUserReportCustomAttribute(): void {}
  };
  const userReportIdcColumnServiceMock = {
    deleteUserReportIdcColumn(): void {},
    postUserReportIdcColumn(): void {},
    putUserReportIdcColumn(): void {}
  };
  const userReportServiceMock = {
    postUserReport(): void {}
  };
  const userServiceMock = {
    getUser(): { id: number } {
      return { id: userId };
    }
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PositionsReportSaveHelper,
        {
          provide: UserReportColumnService,
          useValue: userReportColumnServiceMock
        },
        {
          provide: UserReportCustomAttributeService,
          useValue: userReportCustomAttributeServiceMock
        },
        {
          provide: UserReportIdcColumnService,
          useValue: userReportIdcColumnServiceMock
        },
        {
          provide: UserReportService,
          useValue: userReportServiceMock
        },
        {
          provide: UserService,
          useValue: userServiceMock
        }
      ]
    });
    service = TestBed.inject(PositionsReportSaveHelper);
    userReportColumnService = TestBed.inject(UserReportColumnService);
    userReportCustomAttributeService = TestBed.inject(
      UserReportCustomAttributeService
    );
    userReportIdcColumnService = TestBed.inject(UserReportIdcColumnService);
    userReportService = TestBed.inject(UserReportService);
    userService = TestBed.inject(UserService);
  });

  describe('save()', () => {
    it('should post a new user report and its columns', async () => {
      spyOn(userService, 'getUser').and.returnValue({ id: userId } as User);
      spyOn(userReportService, 'postUserReport').and.returnValue(
        Promise.resolve({ id: userReportId } as UserReport)
      );
      spyOn(userReportColumnService, 'postUserReportColumn').and.returnValues(
        Promise.resolve(userReportColumn1),
        Promise.resolve(userReportColumn2)
      );
      spyOn(
        userReportCustomAttributeService,
        'postUserReportCustomAttribute'
      ).and.returnValues(
        Promise.resolve(userReportCustomAttribute1),
        Promise.resolve(userReportCustomAttribute2)
      );
      spyOn(
        userReportIdcColumnService,
        'postUserReportIdcColumn'
      ).and.returnValues(
        Promise.resolve(userReportIdcColumn1),
        Promise.resolve(userReportIdcColumn2)
      );
      const result = await service.save({
        clientReportColumns,
        reportId,
        selectedColumns: [
          reportingColumnReportColumn1,
          reportingColumnReportColumn2,
          reportingColumnCustomAttribute1,
          reportingColumnCustomAttribute2,
          reportingColumnIdcColumn1,
          reportingColumnIdcColumn2
        ],
        userReportColumns: [],
        userReportCustomAttributes: [],
        userReportIdcColumns: []
      });
      expect(userService.getUser).toHaveBeenCalledTimes(1);
      expect(userReportService.postUserReport).toHaveBeenCalledWith({
        clientReportId: clientReportColumns[0].clientReportId,
        isPnklInternal: true,
        reportName: 'postions_internal',
        reportId,
        userId
      } as any);
      expect(userReportColumnService.postUserReportColumn).toHaveBeenCalledWith(
        userReportColumnToPost1
      );
      expect(userReportColumnService.postUserReportColumn).toHaveBeenCalledWith(
        userReportColumnToPost2
      );
      expect(
        userReportCustomAttributeService.postUserReportCustomAttribute
      ).toHaveBeenCalledWith(userReportCustomAttributeToPost1);
      expect(
        userReportCustomAttributeService.postUserReportCustomAttribute
      ).toHaveBeenCalledWith(userReportCustomAttributeToPost2);
      expect(
        userReportIdcColumnService.postUserReportIdcColumn
      ).toHaveBeenCalledWith(userReportIdcColumnToPost1);
      expect(
        userReportIdcColumnService.postUserReportIdcColumn
      ).toHaveBeenCalledWith(userReportIdcColumnToPost2);
      expect(result).toEqual({
        userReportColumns: [userReportColumn1, userReportColumn2],
        userReportCustomAttributes: [
          userReportCustomAttribute1,
          userReportCustomAttribute2
        ],
        userReportIdcColumns: [userReportIdcColumn1, userReportIdcColumn2]
      });
    });
    it('should post, put or delete report columns', async () => {
      spyOn(userReportColumnService, 'deleteUserReportColumn').and.returnValues(
        Promise.resolve()
      );
      spyOn(userReportColumnService, 'postUserReportColumn').and.returnValues(
        Promise.resolve(userReportColumn2)
      );
      spyOn(userReportColumnService, 'putUserReportColumn').and.returnValues(
        Promise.resolve(userReportColumn1)
      );
      spyOn(
        userReportCustomAttributeService,
        'deleteUserReportCustomAttribute'
      ).and.returnValues(Promise.resolve());
      spyOn(
        userReportCustomAttributeService,
        'postUserReportCustomAttribute'
      ).and.returnValues(Promise.resolve(userReportCustomAttribute2));
      spyOn(
        userReportCustomAttributeService,
        'putUserReportCustomAttribute'
      ).and.returnValues(Promise.resolve(userReportCustomAttribute1));

      spyOn(
        userReportIdcColumnService,
        'deleteUserReportIdcColumn'
      ).and.returnValues(Promise.resolve());
      spyOn(
        userReportIdcColumnService,
        'postUserReportIdcColumn'
      ).and.returnValues(Promise.resolve(userReportIdcColumn2));
      spyOn(
        userReportIdcColumnService,
        'putUserReportIdcColumn'
      ).and.returnValues(Promise.resolve(userReportIdcColumn1));
      const result = await service.save({
        clientReportColumns: [],
        reportId,
        selectedColumns: [
          reportingColumnReportColumn1,
          reportingColumnReportColumn2,
          reportingColumnReportColumn3,
          reportingColumnCustomAttribute1,
          reportingColumnCustomAttribute2,
          reportingColumnCustomAttribute3,
          reportingColumnIdcColumn1,
          reportingColumnIdcColumn2,
          reportingColumnIdcColumn3
        ],
        userReportColumns: [
          existingUserReportColumn1,
          existingUserReportColumn2,
          existingUserReportColumn3
        ],
        userReportCustomAttributes: [
          existingUserReportCustomAttribute1,
          existingUserReportCustomAttribute2,
          existingUserReportCustomAttribute3
        ],
        userReportIdcColumns: [
          existingUserReportIdcColumn1,
          existingUserReportIdcColumn2,
          existingUserReportIdcColumn3
        ]
      });
      expect(
        userReportColumnService.deleteUserReportColumn
      ).toHaveBeenCalledWith(existingUserReportColumn2.id);
      expect(userReportColumnService.postUserReportColumn).toHaveBeenCalledWith(
        userReportColumnToPost2
      );
      expect(userReportColumnService.putUserReportColumn).toHaveBeenCalledWith(
        userReportColumnToPut1
      );
      expect(
        userReportCustomAttributeService.deleteUserReportCustomAttribute
      ).toHaveBeenCalledWith(existingUserReportCustomAttribute2.id);
      expect(
        userReportCustomAttributeService.postUserReportCustomAttribute
      ).toHaveBeenCalledWith(userReportCustomAttributeToPost2);
      expect(
        userReportCustomAttributeService.putUserReportCustomAttribute
      ).toHaveBeenCalledWith(userReportCustomAttributeToPut1);
      expect(
        userReportIdcColumnService.deleteUserReportIdcColumn
      ).toHaveBeenCalledWith(existingUserReportIdcColumn2.id);
      expect(
        userReportIdcColumnService.postUserReportIdcColumn
      ).toHaveBeenCalledWith(userReportIdcColumnToPost2);
      expect(
        userReportIdcColumnService.putUserReportIdcColumn
      ).toHaveBeenCalledWith(userReportIdcColumnToPut1);
      expect(result).toEqual({
        userReportColumns: [
          existingUserReportColumn3,
          userReportColumn2,
          userReportColumn1
        ],
        userReportCustomAttributes: [
          existingUserReportCustomAttribute3,
          userReportCustomAttribute2,
          userReportCustomAttribute1
        ],
        userReportIdcColumns: [
          existingUserReportIdcColumn3,
          userReportIdcColumn2,
          userReportIdcColumn1
        ]
      });
    });
  });
});

const clientReportColumns = [
  { clientReportId: 1, id: 2 }
] as ClientReportColumn[];
const reportId = 45;
const userReportId = 1001;

const existingUserReportColumn1: UserReportColumn = {
  caption: 'Asset Type',
  decimalPlaces: null,
  filterValues: ['BANKDEBT'],
  groupOrder: 2,
  id: 1,
  isAggregating: true,
  name: 'AssetType',
  renderingFunction: null,
  reportColumnId: 101,
  sortAscending: false,
  sortOrder: 2,
  type: 'text',
  userReportId,
  formula: null,
  viewOrder: 2
};
const userReportColumnToPut1 = {
  filterValues: ['BOND'],
  groupOrder: 1,
  id: 1,
  isAggregating: false,
  sortAscending: true,
  sortOrder: 1,
  viewOrder: 1
} as UserReportColumn;
const reportingColumnReportColumn1: ReportingColumn = {
  caption: 'Asset Type',
  convertToBaseCurrency: false,
  dbId: 101,
  decimalPlaces: null,
  filters: ['BOND'],
  groupOrder: 1,
  include: true,
  isAggregating: false,
  name: 'AssetType',
  renderingFunction: null,
  reportingColumnType: 'report',
  sortAscending: true,
  sortOrder: 1,
  type: 'text',
  formula: null,
  viewOrder: 1
};
const userReportColumnToPost1 = {
  filterValues: ['BOND'],
  groupOrder: 1,
  isAggregating: false,
  renderingFunction: null,
  reportColumnId: 101,
  sortAscending: true,
  sortOrder: 1,
  userReportId,
  viewOrder: 1
} as UserReportColumn;
const userReportColumn1: UserReportColumn = {
  ...userReportColumnToPost1,
  caption: 'Asset Type',
  decimalPlaces: null,
  id: 1,
  name: 'AssetType',
  type: 'text'
};

const existingUserReportColumn2 = {
  id: 72,
  name: 'Sector'
} as UserReportColumn;
const reportingColumnReportColumn2: ReportingColumn = {
  caption: 'MVUSD',
  convertToBaseCurrency: true,
  dbId: 102,
  decimalPlaces: 2,
  filters: null,
  groupOrder: null,
  include: true,
  isAggregating: true,
  name: 'MVUSD',
  renderingFunction: null,
  reportingColumnType: 'report',
  sortAscending: false,
  sortOrder: 2,
  type: 'numeric',
  formula: null,
  viewOrder: 2
};
const userReportColumnToPost2 = {
  filterValues: null,
  groupOrder: null,
  isAggregating: true,
  renderingFunction: null,
  reportColumnId: 102,
  sortAscending: false,
  sortOrder: 2,
  userReportId,
  viewOrder: 2
} as UserReportColumn;
const userReportColumn2: UserReportColumn = {
  ...userReportColumnToPost2,
  caption: 'MVUSD',
  decimalPlaces: 2,
  id: 2,
  name: 'MVUSD',
  type: 'numeric'
};

const existingUserReportCustomAttribute1: UserReportCustomAttribute = {
  customAttributeId: 103,
  filterValues: 12.5,
  groupOrder: 22,
  id: 3,
  isAggregating: false,
  name: 'Credit Attribution',
  sortAscending: false,
  sortOrder: 33,
  type: 'numeric',
  userReportId,
  viewOrder: 33
};
const userReportCustomAttributeToPut1 = {
  filterValues: null,
  groupOrder: null,
  id: 3,
  isAggregating: true,
  sortAscending: true,
  sortOrder: 3,
  viewOrder: 3
} as UserReportCustomAttribute;
const reportingColumnCustomAttribute1: ReportingColumn = {
  caption: 'Credit Attribution',
  convertToBaseCurrency: true,
  dbId: 103,
  decimalPlaces: 2,
  filters: null,
  groupOrder: null,
  include: true,
  isAggregating: true,
  name: 'Credit Attribution',
  renderingFunction: null,
  reportingColumnType: 'ca',
  sortAscending: true,
  sortOrder: 3,
  type: 'numeric',
  formula: null,
  viewOrder: 3
};
const userReportCustomAttributeToPost1 = {
  customAttributeId: 103,
  filterValues: null,
  groupOrder: null,
  isAggregating: true,
  sortAscending: true,
  sortOrder: 3,
  userReportId,
  viewOrder: 3
} as UserReportCustomAttribute;
const userReportCustomAttribute1: UserReportCustomAttribute = {
  ...userReportCustomAttributeToPost1,
  id: 3,
  name: 'Credit Attribution',
  type: 'numeric'
};
const existingUserReportCustomAttribute2 = {
  id: 73,
  name: 'Rho Attribution'
} as UserReportCustomAttribute;
const reportingColumnCustomAttribute2: ReportingColumn = {
  caption: 'Internal Rating',
  convertToBaseCurrency: null,
  dbId: 104,
  decimalPlaces: null,
  filters: ['A+'],
  groupOrder: 2,
  include: true,
  isAggregating: false,
  name: 'Internal Rating',
  renderingFunction: null,
  reportingColumnType: 'ca',
  sortAscending: false,
  sortOrder: 4,
  formula: null,
  type: 'numeric',
  viewOrder: 4
};
const userReportCustomAttributeToPost2 = {
  customAttributeId: 104,
  filterValues: ['A+'],
  groupOrder: 2,
  isAggregating: false,
  sortAscending: false,
  sortOrder: 4,
  userReportId,
  viewOrder: 4
} as UserReportCustomAttribute;
const userReportCustomAttribute2: UserReportCustomAttribute = {
  ...userReportCustomAttributeToPost1,
  id: 4,
  name: 'Internal Rating',
  type: 'numeric'
};
const existingUserReportCustomAttribute3: UserReportCustomAttribute = {
  customAttributeId: 105,
  filterValues: 5,
  groupOrder: 200,
  id: 4,
  isAggregating: false,
  name: 'Spread',
  sortAscending: false,
  sortOrder: 44,
  type: 'numeric',
  userReportId,
  viewOrder: 44
};
const reportingColumnCustomAttribute3: ReportingColumn = {
  caption: 'Spread',
  convertToBaseCurrency: null,
  dbId: 105,
  decimalPlaces: null,
  filters: 5,
  groupOrder: 200,
  include: true,
  isAggregating: false,
  name: 'Spread',
  renderingFunction: null,
  reportingColumnType: 'ca',
  sortAscending: false,
  sortOrder: 44,
  type: 'numeric',
  formula: null,
  viewOrder: 44
};

const existingUserReportIdcColumn1: UserReportIdcColumn = {
  caption: 'Bond Form Type',
  filterValues: ['XX'],
  groupOrder: 33,
  id: 5,
  idcColumnId: 105,
  isAggregating: null,
  name: 'debt.bond_form.bond_form_type',
  sortAscending: false,
  sortOrder: 55,
  type: 'text',
  userReportId,
  viewOrder: 55
};
const reportingColumnIdcColumn1: ReportingColumn = {
  caption: 'Bond Form Type',
  convertToBaseCurrency: null,
  dbId: 105,
  decimalPlaces: null,
  filters: null,
  groupOrder: 3,
  include: true,
  isAggregating: null,
  name: 'debt.bond_form.bond_form_type',
  renderingFunction: null,
  reportingColumnType: 'idc',
  sortAscending: true,
  sortOrder: 5,
  formula: null,
  type: 'text',
  viewOrder: 5
};
const userReportIdcColumnToPost1 = {
  filterValues: null,
  groupOrder: 3,
  idcColumnId: 105,
  isAggregating: null,
  sortAscending: true,
  sortOrder: 5,
  userReportId,
  viewOrder: 5
} as UserReportIdcColumn;
const userReportIdcColumnToPut1 = {
  filterValues: null,
  groupOrder: 3,
  id: 5,
  sortAscending: true,
  sortOrder: 5,
  viewOrder: 5
} as UserReportIdcColumn;
const userReportIdcColumn1: UserReportIdcColumn = {
  ...userReportIdcColumnToPost1,
  caption: 'Bond Form Type',
  id: 5,
  name: 'debt.bond_form.bond_form_type',
  type: 'text'
};
const existingUserReportIdcColumn2 = {
  id: 7,
  name:
    'debt.convertible_instruments.convert_details.conditional_conversion_ind'
} as UserReportIdcColumn;
const reportingColumnIdcColumn2: ReportingColumn = {
  caption: 'Debt Type',
  convertToBaseCurrency: null,
  dbId: 106,
  decimalPlaces: null,
  filters: null,
  groupOrder: 4,
  include: true,
  isAggregating: null,
  name: 'debt.fixed_income.debt_type',
  renderingFunction: null,
  reportingColumnType: 'idc',
  sortAscending: false,
  sortOrder: 6,
  type: 'text',
  formula: null,
  viewOrder: 6
};
const userReportIdcColumnToPost2 = {
  filterValues: null,
  groupOrder: 4,
  idcColumnId: 106,
  isAggregating: null,
  sortAscending: false,
  sortOrder: 6,
  userReportId,
  viewOrder: 6
} as UserReportIdcColumn;
const userReportIdcColumn2: UserReportIdcColumn = {
  ...userReportIdcColumnToPost2,
  caption: 'Debt Type',
  id: 6,
  name: 'debt.fixed_income.debt_type',
  type: 'text'
};
const existingUserReportIdcColumn3: UserReportIdcColumn = {
  caption: 'Marginability Indicator',
  filterValues: 5,
  groupOrder: 8,
  id: 8,
  idcColumnId: 108,
  isAggregating: null,
  name: 'equity.equity_details.marginability_indicator',
  sortAscending: true,
  sortOrder: 8,
  type: 'text',
  userReportId,
  viewOrder: 8
};
const reportingColumnIdcColumn3: ReportingColumn = {
  caption: 'Marginability Indicator',
  convertToBaseCurrency: null,
  dbId: 108,
  decimalPlaces: null,
  filters: 5,
  groupOrder: 8,
  include: true,
  isAggregating: null,
  name: 'equity.equity_details.marginability_indicator',
  renderingFunction: null,
  reportingColumnType: 'idc',
  sortAscending: true,
  sortOrder: 8,
  formula: null,
  type: 'text',
  viewOrder: 8
};

const existingUserReportColumn3: UserReportColumn = {
  caption: 'Account Code',
  decimalPlaces: null,
  filterValues: ['CMST'],
  groupOrder: 2,
  id: 73,
  isAggregating: true,
  name: 'AccountCode',
  renderingFunction: null,
  reportColumnId: 101,
  sortAscending: false,
  sortOrder: 2,
  type: 'text',
  formula: null,
  userReportId,
  viewOrder: 2
};
const reportingColumnReportColumn3: ReportingColumn = {
  caption: 'Account Code',
  convertToBaseCurrency: null,
  dbId: 73,
  decimalPlaces: null,
  filters: ['CMST'],
  groupOrder: 2,
  include: true,
  isAggregating: true,
  name: 'AccountCode',
  renderingFunction: null,
  reportingColumnType: 'report',
  sortAscending: false,
  sortOrder: 2,
  formula: null,
  type: 'text',
  viewOrder: 2
};
