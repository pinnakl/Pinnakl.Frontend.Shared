import { DatePipe } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';

import { ColDef, GridOptions, ICellRendererParams } from 'ag-grid-community';
import * as _ from 'lodash';

import { AdminAccount, CustomAttributeFeature } from '@pnkl-frontend/shared';
import { AuditLog } from '@pnkl-frontend/shared';
import { ClientConnectivity } from '@pnkl-frontend/shared';
import { AdminIdentifier } from '@pnkl-frontend/shared';
import { CustomAttributeValue } from '@pnkl-frontend/shared';
import { Market } from '@pnkl-frontend/shared';
import { Organization } from '@pnkl-frontend/shared';
import { PbIdentifier } from '@pnkl-frontend/shared';
import { PublicIdentifier } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import { SecurityType } from '@pnkl-frontend/shared';
import { Security } from '@pnkl-frontend/shared';
import { AccountService } from '@pnkl-frontend/shared';
import { AuditLogService } from '@pnkl-frontend/shared';
import { OMSService } from '@pnkl-frontend/shared';
import { AdminIdentifierService } from '@pnkl-frontend/shared';
import { CustomAttributesService } from '@pnkl-frontend/shared';
import { MarketService } from '@pnkl-frontend/shared';
import { OrganizationService } from '@pnkl-frontend/shared';
import { PbIdentifierService } from '@pnkl-frontend/shared';
import { PublicIdentifierService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../shared/securities-helper.service';

@Component({
  selector: 'security-history',
  templateUrl: 'securities-history.component.html',
  providers: [DatePipe]
})
export class SecurityHistoryComponent implements OnChanges, OnInit, OnDestroy {
  adminAccounts: AdminAccount[];

  @Input() adminIdentifiers: AdminIdentifier[];
  @Input() assetType: string;
  @Input() currentTab: string;
  @Input() clientConnectivities: ClientConnectivity[];
  @Input() customAttributeValues: CustomAttributeValue[];
  @Input() pbIdentifiers: PbIdentifier[];
  @Input() publicIdentifiers: PublicIdentifier[];
  @Input() security: Security;

  attrsIdAndNameMapping: any[];
  colDefForAdminIdentifier: ColDef[];
  existingIdentifiers: PublicIdentifier[];
  gridHeight = '800px';
  tab = 'nothing';
  colDefs: ColDef[] = [];
  rowData: any;
  adminRowData: any;
  adminGridOptions: GridOptions = {};
  gridOptions: GridOptions = {};
  formSubmittedSubscription: any;

  // Master Table Data
  accounts: AdminAccount[];
  admins: ClientConnectivity[];
  custodians: ClientConnectivity[];
  currencies: any[];
  couponTypes: SecurityAttributeOption[];
  intrestBasis: SecurityAttributeOption[];
  markets: Market[];
  organizations: Organization[];
  paymentFrequencies: SecurityAttributeOption[];
  securityTypes: SecurityType[];

  private _securitiesLogs: AuditLog[];
  get securitiesLogs(): Promise<AuditLog[]> {
    if (_.isEmpty(this._securitiesLogs)) {
      return this.auditLogService
        .getAuditLogsForTable('c_securities', this.security.id)
        .then(result => {
          this._securitiesLogs = result;
          return _.orderBy(
            this._securitiesLogs,
            ['pk', x => x.logTime.getTime()],
            ['asc', 'desc']
          );
        })
        .catch(this.utility.errorHandler.bind(this));
    }
    return Promise.resolve(this._securitiesLogs);
  }

  private _assetLogs: AuditLog[];
  get assetLogs(): Promise<AuditLog[]> {
    if (_.isEmpty(this._assetLogs)) {
      const tableName = this.getTableNamesForAssetType(this.assetType);
      return this.auditLogService
        .getAuditLogsForTable(tableName, this.securitiesHelper.assetId)
        .then(result => {
          this._assetLogs = result;
          return _.orderBy(
            this._assetLogs,
            ['pk', x => x.logTime.getTime()],
            ['asc', 'desc']
          );
        })
        .catch(this.utility.errorHandler.bind(this));
    }
    return Promise.resolve(this._assetLogs);
  }

  private _customAttributeLogs: AuditLog[] = [];
  get customAttributeLogs(): Promise<AuditLog[]> {
    if (_.isEmpty(this._customAttributeLogs)) {
      return Promise.all([
        this.auditLogService.getAuditLogsForTableFieldWithAction(
          'd',
          ['SecurityId', 'CustomAttributeId'],
          'c_securityCustomAttributeValues'
        ),
        this.customAttributesService.getCustomAttributeValuesForFeature(
          this.security.id,
          CustomAttributeFeature.SECURITY
        ),
        this.customAttributesService.getCustomAttributes(CustomAttributeFeature.SECURITY)
      ])
        .then(results => {
          const [deletedAttrsLog, existingAttrs, customAttributes] = results,
            deletedAttrsIds = deletedAttrsLog
              .filter(
                attr =>
                  attr.fieldname === 'SecurityId' &&
                  attr.oldValue === this.security.id.toString()
              )
              .map(log => log.pk.toString()),
            existingAttrsIds = existingAttrs.map(customAttr => customAttr.id.toString());

          this.attrsIdAndNameMapping = deletedAttrsLog
            .filter(attr => attr.fieldname === 'CustomAttributeId')
            .map(log => ({
                attrId: log.pk.toString(),
                attrName: customAttributes.find(
                  attr => attr.id.toString() === log.oldValue
                ).name
              }))
            .concat(
              existingAttrs.map(attr => ({
                  attrId: attr.id.toString(),
                  attrName: customAttributes.find(
                    attribute => attribute.id === attr.customAttributeId
                  ).name
                }))
            );
          this.customAttributeValues = existingAttrs;
          return this.auditLogService.getAuditLogsForTableAndIds(
            'c_securityCustomAttributeValues',
            deletedAttrsIds.concat(existingAttrsIds)
          );
        })
        .then(results => {
          this._customAttributeLogs = results.reduce(
            (customAttrLogs, result) => {
              if (result != null && result.fieldname === 'Value') {
                customAttrLogs.push(result);
              }
              return customAttrLogs;
            },
            [] as AuditLog[]
          );
          return _.orderBy(
            this._customAttributeLogs,
            ['pk', x => x.logTime.getTime()],
            ['asc', 'desc']
          );
        })
        .catch(this.utility.errorHandler.bind(this));
    }
    return Promise.resolve(this._customAttributeLogs);
  }

  private _securityIdentifierLogs: AuditLog[];
  get securityIdentifierLogs(): Promise<AuditLog[]> {
    if (_.isEmpty(this._securityIdentifierLogs)) {
      return Promise.all([
        this.auditLogService.getDeletedAuditLogForSecurityId(
          'SecurityId',
          this.security.id,
          'c_SecurityIdentifiers'
        ),
        this.publicIdentifierService.getPublicIdentifiers(this.security.id)
      ])
        .then(results => {
          const [deletedIdfsLog, existingIdfs] = results,
            deletedIdfsIds = deletedIdfsLog.map(log => log.pk.toString()),
            existingIdfsIds = existingIdfs.map(identifier => identifier.id.toString());
          return this.auditLogService.getAuditLogsForTableAndIds(
            'c_SecurityIdentifiers',
            deletedIdfsIds.concat(existingIdfsIds)
          );
        })
        .then(result => {
          this._securityIdentifierLogs = result;
          return this._securityIdentifierLogs;
        })
        .catch(this.utility.errorHandler.bind(this));
    }
    return Promise.resolve(this._securityIdentifierLogs);
  }

  private _externalPublicIdentifierLogs: AuditLog[];
  get externalPublicIdentifierLogs(): Promise<AuditLog[]> {
    if (_.isEmpty(this._externalPublicIdentifierLogs)) {
      return Promise.all([
        this.auditLogService.getDeletedAuditLogForSecurityId(
          'PnklSecId',
          this.security.id,
          'c_ExtPbId'
        ),
        this.pbIdentifierService.getIdentifiers(this.security.id)
      ])
        .then(results => {
          const [deletedIdfsLog, existingIdfs] = results,
            deletedIdfsIds = deletedIdfsLog.map(log => log.pk.toString()),
            existingIdfsIds = existingIdfs.map(identifier => identifier.id.toString());
          return this.auditLogService.getAuditLogsForTableAndIds(
            'c_ExtPbId',
            deletedIdfsIds.concat(existingIdfsIds)
          );
        })
        .then(result => {
          this._externalPublicIdentifierLogs = result;
          return this._externalPublicIdentifierLogs;
        })
        .catch(this.utility.errorHandler.bind(this));
    }
    return Promise.resolve(this._externalPublicIdentifierLogs);
  }

  private _externalAdminIdentifierLogs: AuditLog[];
  get externalAdminIdentifierLogs(): Promise<AuditLog[]> {
    if (_.isEmpty(this._externalAdminIdentifierLogs)) {
      return Promise.all([
        this.auditLogService.getDeletedAuditLogForSecurityId(
          'PnklSecId',
          this.security.id,
          'c_ExtAdminId'
        ),
        this.adminIdentifierService.getIdentifiers(this.security.id)
      ])
        .then(results => {
          const [deletedIdfsLog, existingIdfs] = results,
            deletedIdfsIds = deletedIdfsLog.map(log => log.pk.toString()),
            existingIdfsIds = existingIdfs.map(identifier => identifier.id.toString());
          return this.auditLogService.getAuditLogsForTableAndIds(
            'c_ExtAdminId',
            deletedIdfsIds.concat(existingIdfsIds)
          );
        })
        .then(result => {
          this._externalAdminIdentifierLogs = result;
          return this._externalAdminIdentifierLogs;
        })
        .catch(this.utility.errorHandler.bind(this));
    }
    return Promise.resolve(this._externalAdminIdentifierLogs);
  }

  colDefForAdditionalAndCustom = [
    {
      headerName: 'Field',
      field: 'fieldName',
      enableRowGroup: true
    },
    {
      headerName: 'Value',
      field: 'value',
      enableRowGroup: true
    },
    {
      headerName: 'LogTime',
      field: 'logTime',
      enableRowGroup: true,
      filter: 'date',
      valueFormatter: this.dateFormatter.bind(this)
    },
    {
      headerName: 'user',
      field: 'User',
      enableRowGroup: true
    }
  ];
  colDefsForTabs = {
    securityInformation: this.colDefForAdditionalAndCustom,
    additionalInformation: this.colDefForAdditionalAndCustom,
    customAttributes: this.colDefForAdditionalAndCustom,
    publicIdentifiers: [
      { headerName: 'MARKET', field: 'marketId', enableRowGroup: true },
      { headerName: 'ID TYPE', field: 'identifierType', enableRowGroup: true },
      { headerName: 'ID', field: 'identifierId', enableRowGroup: true },
      { headerName: 'START DATE', field: 'startDate', enableRowGroup: true },
      { headerName: 'END DATE', field: 'endDate', enableRowGroup: true },
      {
        headerName: 'Log Time',
        field: 'logTime',
        enableRowGroup: true,
        valueFormatter: this.dateFormatter.bind(this)
      },
      { headerName: 'USER', field: 'user', enableRowGroup: true }
    ],
    externalIdentifiers: [
      { headerName: 'ID TYPE', field: 'identifierType', enableRowGroup: true },
      { headerName: 'ID', field: 'identifier', enableRowGroup: true },
      {
        headerName: 'Log Time',
        field: 'logTime',
        enableRowGroup: true,
        valueFormatter: this.dateFormatter.bind(this)
      },
      { headerName: 'USER', field: 'user', enableRowGroup: true }
    ]
  };

  COUPON_TYPES =
    '/security_master/payload/instrument/debt/fixed_income/coupon_type';
  INTEREST_BASIS =
    '/security_master/payload/instrument/debt/coupon_payment_feature/interest_basis';
  PAYMENT_FREQUENCY =
    '/security_master/payload/instrument/debt/coupon_payment_feature/payment_frequency';

  assetFieldsMapping = {
    bond: {
      securityInformation: {
        SecTypeId: { name: 'BOND TYPE', dataType: 'string' },

        Description: { name: 'DESCRIPTION', dataType: 'string' },
        Sector: { name: 'SECTOR', dataType: 'string' },
        Multiplier: { name: 'MULTIPLIER', dataType: 'number' },
        CurrencyId: { name: 'CURRENCY', dataType: 'string' },
        maturity_date: { name: 'MATURITY DATE', dataType: 'date' },
        PrivateIndicator: { name: 'PRIVATE', dataType: 'boolean' },
        ManualPricingIndicator: { name: 'MANUAL PRICING', dataType: 'boolean' },
        SandPRating: { name: 'S&P RATING', dataType: 'string' },
        MoodyRating: { name: 'MOODY RATING', dataType: 'string' },
        OrganizationId: { name: 'ORGANIZATION', dataType: 'string' },

        coupon_type: { name: 'COUPON TYPE', dataType: 'string' },
        coupon_rate: { name: 'COUPON RATE', dataType: 'number' },
        interest_basis: { name: 'INTREST BASIS', dataType: 'string' },
        payment_frequency: { name: 'PAYMENT FREQUENCY', dataType: 'string' },
        first_accrual_date: { name: 'FIRST ACCRUAL DATE', dataType: 'date' },
        first_coupon_date: { name: 'FIRST COUPON DATE', dataType: 'date' },
        accruing_indicator: { name: 'ACCRUING INDICATOR', dataType: 'boolean' },

        issue_amount: { name: 'ISSUE AMOUNT', dataType: 'number' },
        outstanding_amount: { name: 'OUTSTANDING AMOUNT', dataType: 'number' },
        min_piece: { name: 'MINIMUM PIECE', dataType: 'number' },
        nominal_value: { name: 'NOMINAL VALUE', dataType: 'number' },
        principal_factor: { name: 'PRINCIPAL FACTOR', dataType: 'number' }
      },
      additionalInformation: {
        UnderlyingSecurityId: {
          name: 'UNDERLYING SECURITY ID',
          dataType: 'string'
        },
        default_indicator: { name: 'DEFAULT', dataType: 'boolean' },
        pik_indicator: { name: 'PIK', dataType: 'boolean' },
        put_indicator: { name: 'PUTABLE', dataType: 'boolean' },
        sink_indicator: { name: 'SINK', dataType: 'boolean' },
        strippable_indicator: { name: 'STRIPPABLE', dataType: 'boolean' },
        convertible_indicator: { name: 'CONVERTIBLE', dataType: 'boolean' },
        call_indicator: { name: 'CALLABLE', dataType: 'boolean' }
      }
    },
    claim: {
      securityInformation: {
        SecTypeId: { name: 'CURRENCY TYPE', dataType: 'string' },

        Description: { name: 'DESCRIPTION', dataType: 'string' },
        Sector: { name: 'SECTOR', dataType: 'string' },
        Multiplier: { name: 'MULTIPLIER', dataType: 'number' },
        PrivateIndicator: { name: 'PRIVATE', dataType: 'boolean' },
        ManualPricingIndicator: { name: 'MANUAL PRICING', dataType: 'boolean' },
        OrganizationId: { name: 'ORGANIZATION', dataType: 'string' }
      }
    },
    currency: {
      securityInformation: {
        SecTypeId: { name: 'CURRENCY TYPE', dataType: 'string' },

        Description: { name: 'DESCRIPTION', dataType: 'string' },
        Sector: { name: 'SECTOR', dataType: 'string' },
        Multiplier: { name: 'MULTIPLIER', dataType: 'number' },
        PrivateIndicator: { name: 'PRIVATE', dataType: 'boolean' },
        ManualPricingIndicator: { name: 'MANUAL PRICING', dataType: 'boolean' },
        OrganizationId: { name: 'ORGANIZATION', dataType: 'string' },

        CurrencyId: { name: 'BASE CURRENCY', dataType: 'string' },
        SecondaryCurrencyId: { name: 'COUNTER CURRENCY', dataType: 'string' },
        Maturity: { name: 'MATURITY DATE', dataType: 'date' },
        ForwardPrice: { name: 'FORWARD PRICE', dataType: 'number' }
      }
    },
    equity: {
      securityInformation: {
        Description: { name: 'DESCRIPTION', dataType: 'string' },
        Sector: { name: 'SECTOR', dataType: 'string' },
        Multiplier: { name: 'MULTIPLIER', dataType: 'number' },
        CurrencyId: { name: 'CURRENCY', dataType: 'string' },
        PrivateIndicator: { name: 'PRIVATE', dataType: 'boolean' },
        ManualPricingIndicator: { name: 'MANUAL PRICING', dataType: 'boolean' },
        OrganizationId: { name: 'ORGANIZATION', dataType: 'string' },

        SharesOutstanding: { name: 'OUTSTANDING AMOUNT', dataType: 'number' },
        dividend_frequency: { name: 'DIV FREQUENCY', dataType: 'string' },
        dividend_rate: { name: 'DIV RATE', dataType: 'number' }
      }
    },
    fund: {
      securityInformation: {
        SecTypeId: { name: 'FUND TYPE', dataType: 'string' },

        Description: { name: 'DESCRIPTION', dataType: 'string' },
        Sector: { name: 'SECTOR', dataType: 'string' },
        Multiplier: { name: 'MULTIPLIER', dataType: 'number' },
        CurrencyId: { name: 'CURRENCY', dataType: 'string' },
        PrivateIndicator: { name: 'PRIVATE', dataType: 'boolean' },
        ManualPricingIndicator: { name: 'MANUAL PRICING', dataType: 'boolean' },
        OrganizationId: { name: 'ORGANIZATION', dataType: 'string' },

        dividend_frequency: { name: 'DIV FREQUENCY', dataType: 'string' },
        dividend_rate: { name: 'DIV RATE', dataType: 'number' },
        SharesOutstanding: { name: 'OUTSTANDING AMOUNT', dataType: 'number' }
      }
    },
    future: {
      securityInformation: {
        Description: { name: 'DESCRIPTION', dataType: 'string' },
        Sector: { name: 'SECTOR', dataType: 'string' },
        Multiplier: { name: 'MULTIPLIER', dataType: 'number' },
        CurrencyId: { name: 'CURRENCY', dataType: 'string' },
        PrivateIndicator: { name: 'PRIVATE', dataType: 'boolean' },
        ManualPricingIndicator: { name: 'MANUAL PRICING', dataType: 'boolean' },
        OrganizationId: { name: 'ORGANIZATION', dataType: 'string' },

        contract_size: { name: 'CONTRACT SIZE', dataType: 'number' },
        expiration_date: { name: 'EXPIRATION DATE', dataType: 'date' },
        last_tradeable_date: { name: 'LAST TRADABLE DATE', dataType: 'date' },
        tick_size: { name: 'TICK SIZE', dataType: 'number' },
        tick_value: { name: 'TICK VALUE', dataType: 'number' },
        value_of_1_pt: { name: 'VALUE OF 1 PT', dataType: 'string' }
      }
    },
    bankdebt: {
      securityInformation: {
        Description: { name: 'DESCRIPTION', dataType: 'string' },
        Sector: { name: 'SECTOR', dataType: 'string' },
        Multiplier: { name: 'MULTIPLIER', dataType: 'number' },
        CurrencyId: { name: 'CURRENCY', dataType: 'string' },
        maturity_date: { name: 'MATURITY DATE', dataType: 'date' },
        PrivateIndicator: { name: 'PRIVATE', dataType: 'boolean' },
        ManualPricingIndicator: { name: 'MANUAL PRICING', dataType: 'boolean' },
        SandPRating: { name: 'S&P RATING', dataType: 'string' },
        MoodyRating: { name: 'MOODY RATING', dataType: 'string' },
        OrganizationId: { name: 'ORGANIZATION', dataType: 'string' },

        coupon_type: { name: 'COUPON TYPE', dataType: 'string' },
        coupon_rate: { name: 'COUPON RATE', dataType: 'number' },
        outstanding_amount: { name: 'OUTSTANDING AMOUNT', dataType: 'number' },
        interest_basis: { name: 'INTREST BASIS', dataType: 'string' },
        payment_frequency: { name: 'PAYMENT FREQUENCY', dataType: 'string' },
        first_coupon_date: { name: 'FIRST COUPON DATE', dataType: 'string' },
        accruing_indicator: { name: 'ACCRUING INDICATOR', dataType: 'boolean' }
      },
      additionalInformation: {
        default_indicator: { name: 'DEFAULT INDICATOR', dataType: 'boolean' }
      }
    },
    option: {
      securityInformation: {
        SecTypeId: { name: 'OPTION TYPE', dataType: 'string' },

        Description: { name: 'DESCRIPTION', dataType: 'string' },
        Sector: { name: 'SECTOR', dataType: 'string' },
        Multiplier: { name: 'MULTIPLIER', dataType: 'number' },
        CurrencyId: { name: 'CURRENCY', dataType: 'string' },
        PrivateIndicator: { name: 'PRIVATE', dataType: 'boolean' },
        ManualPricingIndicator: { name: 'MANUAL PRICING', dataType: 'boolean' },
        OrganizationId: { name: 'ORGANIZATION', dataType: 'string' },

        contract_size: { name: 'CONTRACT SIZE', dataType: 'number' },
        maturity: { name: 'MATURITY DATE', dataType: 'date' },
        option_type: { name: 'OPTION TYPE', dataType: 'string' },
        put_call_indicator: { name: 'PUT/CALL INDICATOR', dataType: 'string' },
        strike: { name: 'STRIKE', dataType: 'number' }
      },
      additionalInformation: {
        UnderlyingSecurityId: {
          name: 'UNDERLYING SECURITY ID',
          dataType: 'string'
        }
      }
    },
    pfd: {
      securityInformation: {
        SecTypeId: { name: 'PREFERRED TYPE', dataType: 'string' },

        Description: { name: 'DESCRIPTION', dataType: 'string' },
        Sector: { name: 'SECTOR', dataType: 'string' },
        Multiplier: { name: 'MULTIPLIER', dataType: 'number' },
        CurrencyId: { name: 'CURRENCY', dataType: 'string' },
        PrivateIndicator: { name: 'PRIVATE', dataType: 'boolean' },
        ManualPricingIndicator: { name: 'MANUAL PRICING', dataType: 'boolean' },
        SandPRating: { name: 'S&P RATING', dataType: 'string' },
        MoodyRating: { name: 'MOODY RATING', dataType: 'string' },
        OrganizationId: { name: 'ORGANIZATION', dataType: 'string' },

        dividend_frequency: { name: 'DIV FREQUENCY', dataType: 'string' },
        dividend_rate: { name: 'DIV RATE', dataType: 'number' },
        min_piece: { name: 'MINIMAL PRICE', dataType: 'number' },
        nominal_value: { name: 'NOMINAL VALUE', dataType: 'number' },
        outstanding_amount: { name: 'OUTSTANDING AMOUNT', dataType: 'number' }
      },
      additionalInformation: {
        convertible_indicator: { name: 'CONVERTIBLE', dataType: 'boolean' },
        default_indicator: { name: 'DEFAULT', dataType: 'boolean' }
      }
    }
  };

  getRowStyle = params => {
    if (params.data.action === 'Delete') {
      return { color: 'red' };
    }
  };

  constructor(
    private readonly accountService: AccountService,
    private readonly adminIdentifierService: AdminIdentifierService,
    private readonly datePipe: DatePipe,
    private readonly auditLogService: AuditLogService,
    private readonly customAttributesService: CustomAttributesService,
    private readonly marketService: MarketService,
    private readonly pbIdentifierService: PbIdentifierService,
    private readonly publicIdentifierService: PublicIdentifierService,
    private readonly organizationService: OrganizationService,
    private readonly omsService: OMSService,
    private readonly securitiesHelper: SecuritiesHelper,
    private readonly securityService: SecurityService,
    private readonly utility: Utility
  ) { }

  ngOnInit(): void {
    this.formSubmittedSubscription = this.securitiesHelper.formSubmitted.subscribe(
      tab => {
        this.refreshData(this.tab);
      }
    );

    this.gridOptions.getRowStyle = this.getRowStyle;

    this.adminGridOptions.getRowStyle = this.getRowStyle;
  }

  ngOnDestroy(): void {
    this.formSubmittedSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.tab = changes.currentTab.currentValue;

    this.colDefs = this.colDefsForTabs[this.tab];

    this.gridHeight = '800px';
    if (this.tab === 'externalIdentifiers') {
      this.gridHeight = '400px';
      this.colDefForAdminIdentifier = [
        {
          headerName: 'ID TYPE',
          field: 'identifierType',
          enableRowGroup: true
        },
        { headerName: 'ID', field: 'identifier', enableRowGroup: true },
        { headerName: 'Account', field: 'account', enableRowGroup: true },
        { headerName: 'START DATE', field: 'startDate', enableRowGroup: true },
        { headerName: 'END DATE', field: 'endDate', enableRowGroup: true },
        {
          headerName: 'Log Time',
          field: 'logTime',
          enableRowGroup: true,
          valueFormatter: this.dateFormatter.bind(this)
        },
        { headerName: 'USER', field: 'user', enableRowGroup: true }
      ];
    }
    this.refreshDropDownValues(this.tab);
    this.setRowData(this.tab, this.assetType);
  }

  dateFormatter(cell: ICellRendererParams): string {
    const { value } = cell;
    try {
      return this.datePipe.transform(value, 'MM/dd/yyyy hh:mm:ss');
    } catch (e) {
      return value;
    }
  }

  createIdentiferRow(
    action: string,
    log: AuditLog,
    identifierRow: IdentifiersHistory
  ): void {
    const value = action === 'Delete' ? log.oldValue : log.newValue,
      fieldName = log.fieldname;
    if (fieldName === 'MarketId') {
      identifierRow.marketId = this.getValueForIds(fieldName, 'string', value) as string;
    } else if (fieldName === 'Identifier') {
      identifierRow.identifierId = value;
    } else if (fieldName === 'IdentifierType') {
      identifierRow.identifierType = value;
    } else if (fieldName === 'StartDate') {
      identifierRow.startDate = value;
    } else if (fieldName === 'EndDate') {
      identifierRow.endDate = value;
    }
  }

  createPublicIdentifierRow(
    action: string,
    log: AuditLog,
    identifierRow: ExtPublicIdsHistory
  ): void {
    const value = action === 'Delete' ? log.oldValue : log.newValue,
      fieldName = log.fieldname;
    if (fieldName === 'ExtId') {
      identifierRow.identifier = value;
    } else if (fieldName === 'CustodianId') {
      identifierRow.identifierType = this.custodians
        .find(cust => cust.custodianId.toString() === value)
        .entity.toUpperCase();
    }
  }

  createAdminIdentifierRow(
    action: string,
    log: AuditLog,
    identifierRow: ExtAdminIdsHistory
  ): void {
    const value = action === 'Delete' ? log.oldValue : log.newValue,
      fieldName = log.fieldname;
    if (fieldName === 'AdminSecId') {
      identifierRow.identifier = value;
    } else if (fieldName === 'AdminId') {
      identifierRow.identifierType = this.admins
        .find(admin => admin.adminId.toString() === value)
        .entity.toUpperCase();
    } else if (fieldName === 'StartDate') {
      identifierRow.startDate = value;
    } else if (fieldName === 'EndDate') {
      identifierRow.endDate = value;
    } else if (fieldName === 'AccountId') {
      identifierRow.account = this.accounts
        .find(acct => acct.accountId.toString() === value)
        .accountCode.toUpperCase();
    }
  }

  private formatPublicIdentifiers(logs: AuditLog[]): IdentifiersHistory[] {
    logs = _.orderBy(logs, ['pk', x => x.logTime.getTime()], ['asc', 'asc']);
    const formattedLogs: IdentifiersHistory[] = [];
    let currentPk: number,
      identifierRow: IdentifiersHistory,
      currentLogTime;

    for (let i = 0; i < logs.length; i++) {
      currentPk = logs[i].pk;
      identifierRow = null;
      while (i < logs.length && logs[i].pk === currentPk) {
        if (!identifierRow) {
          identifierRow = new IdentifiersHistory();
        }
        currentLogTime = logs[i].logTime;
        identifierRow.logTime = currentLogTime;
        identifierRow.user = logs[i].userName;
        identifierRow.action = logs[i].action;
        while (
          i < logs.length &&
          currentLogTime.getTime() === logs[i].logTime.getTime() &&
          logs[i].pk === currentPk
        ) {
          this.createIdentiferRow(logs[i].action, logs[i], identifierRow);
          i++;
        }
        formattedLogs.push(_.cloneDeep(identifierRow));
      }
    }
    return formattedLogs;
  }

  private formatExtPublicIdentifiersLog(
    logs: AuditLog[]
  ): ExtPublicIdsHistory[] {
    logs = _.orderBy(logs, ['pk', x => x.logTime.getTime()], ['asc', 'asc']);
    const formattedLogs: ExtPublicIdsHistory[] = [];
    let currentPk: number,
      identifierRow: ExtPublicIdsHistory,
      currentLogTime;

    for (let i = 0; i < logs.length; i++) {
      currentPk = logs[i].pk;
      identifierRow = null;
      while (i < logs.length && logs[i].pk === currentPk) {
        if (!identifierRow) {
          identifierRow = new ExtPublicIdsHistory();
        }
        currentLogTime = logs[i].logTime;
        identifierRow.logTime = currentLogTime;
        identifierRow.user = logs[i].userName;
        identifierRow.action = logs[i].action;
        while (
          i < logs.length &&
          currentLogTime.getTime() === logs[i].logTime.getTime() &&
          logs[i].pk === currentPk
        ) {
          this.createPublicIdentifierRow(
            logs[i].action,
            logs[i],
            identifierRow
          );
          i++;
        }
        formattedLogs.push(_.cloneDeep(identifierRow));
      }
    }
    return formattedLogs;
  }

  private formatExtAdminIdentifiersLog(logs: AuditLog[]): ExtAdminIdsHistory[] {
    logs = _.orderBy(logs, ['pk', x => x.logTime.getTime()], ['asc', 'asc']);
    const formattedLogs: ExtAdminIdsHistory[] = [];
    let currentPk: number,
      identifierRow: ExtAdminIdsHistory,
      currentLogTime;

    for (let i = 0; i < logs.length; i++) {
      currentPk = logs[i].pk;
      identifierRow = null;
      while (i < logs.length && logs[i].pk === currentPk) {
        if (!identifierRow) {
          identifierRow = new ExtAdminIdsHistory();
        }
        currentLogTime = logs[i].logTime;
        identifierRow.logTime = currentLogTime;
        identifierRow.user = logs[i].userName;
        identifierRow.action = logs[i].action;
        while (
          i < logs.length &&
          currentLogTime.getTime() === logs[i].logTime.getTime() &&
          logs[i].pk === currentPk
        ) {
          this.createAdminIdentifierRow(logs[i].action, logs[i], identifierRow);
          i++;
        }
        formattedLogs.push(_.cloneDeep(identifierRow));
      }
    }
    return formattedLogs;
  }

  private formatAssetlogs(
    logs: AuditLog[],
    tab: string,
    assetType: string
  ): SecurityHistory[] {
    return logs
      .filter(log => this.assetFieldsMapping[assetType][tab][log.fieldname])
      .map(log => {
        const field = this.assetFieldsMapping[assetType][tab][log.fieldname],
          value = this.getValueForIds(
            log.fieldname,
            field.dataType,
            log.newValue
          );
        return new SecurityHistory(
          field.name,
          value,
          log.logTime,
          log.userName
        );
      });
  }

  private formatCustomAttributes(logs: AuditLog[]): SecurityHistory[] {
    if (_.isEmpty(logs)) {
      return [];
    }
    return logs.map(log => {
      const attrName = this.attrsIdAndNameMapping.find(
        value => value.attrId === log.pk
      ).attrName;
      return new SecurityHistory(
        attrName,
        log.newValue,
        log.logTime,
        log.userName
      );
    });
  }

  private getTableNamesForAssetType(assetType: string): string {
    if (assetType === 'equity') {
      return 'c_Equities';
    }
    if (assetType === 'bankdebt') {
      return 'c_loans';
    }
    return `c_${assetType}s`;
  }

  private getValueForIds(field: string, type: string, value: string): number | null | string | boolean {
    switch (field) {
      case 'CurrencyId': {
        return this.currencies.find(curr => curr.id.toString() === value)
          .currency;
      }
      case 'MarketId': {
        return value
          ? this.markets.find(market => market.id.toString() === value).mic
          : null;
      }
      case 'OrganizationId': {
        return value
          ? this.organizations.find(org => org.id.toString() === value).name
          : null;
      }
      case 'SecondaryCurrencyId': {
        return this.currencies.find(curr => curr.id.toString() === value)
          .currency;
      }
      case 'SecTypeId': {
        return this.securityTypes.find(
          secType => secType.id.toString() === value
        ).secTypeDescription;
      }
      case 'coupon_type': {
        return this.couponTypes.find(
          coupon => coupon.optionValue.toString() === value
        ).optionDescription;
      }
      case 'interest_basis': {
        return this.intrestBasis.find(
          coupon => coupon.optionValue.toString() === value
        ).optionDescription;
      }
      case 'payment_frequency': {
        return this.paymentFrequencies.find(
          pf => pf.optionValue.toString() === value
        ).optionDescription;
      }
      default: {
        return this.formatValue(type, value);
      }
    }
  }

  private formatValue(type: string, value: string): string | boolean | number {
    if (type === 'boolean') {
      return value === '1';
    }
    if (type === 'number') {
      return parseFloat(value);
    }
    return value;
  }

  /**
   * Will refresh the Audit logs once save will be clicked on any tab
   */
  private refreshData(tab: string): void {
    switch (tab) {
      case 'securityInformation': {
        this._securitiesLogs = null;
        this._assetLogs = null;
        break;
      }
      case 'additionalInformation': {
        this._assetLogs = null;
        break;
      }
      case 'publicIdentifiers': {
        this._securityIdentifierLogs = null;
        break;
      }
      case 'externalIdentifiers': {
        this._externalAdminIdentifierLogs = null;
        this._externalPublicIdentifierLogs = null;
        break;
      }
      case 'customAttributes': {
        this._customAttributeLogs = null;
        break;
      }
    }
    this.setRowData(this.tab, this.assetType);
  }

  private refreshDropDownValues(tab: string): void {
    switch (tab) {
      case 'securityInformation': {
        this.omsService
          .getCurrencies()
          .then(results => (this.currencies = results));
        this.securityService
          .getSecurityTypesForAssetType(this.security.assetTypeId)
          .then(results => (this.securityTypes = results));
        this.securityService
          .getSecurityAttributeOptions(this.COUPON_TYPES, true)
          .then(results => (this.couponTypes = results));
        this.securityService
          .getSecurityAttributeOptions(this.INTEREST_BASIS, true)
          .then(results => (this.intrestBasis = results));
        this.securityService
          .getSecurityAttributeOptions(this.PAYMENT_FREQUENCY, true)
          .then(results => (this.paymentFrequencies = results));
        this.organizationService
          .getAllOrganizations()
          .then(results => (this.organizations = results));
        break;
      }
      case 'additionalInformation': {
        break;
      }
      case 'publicIdentifiers': {
        this.marketService
          .getMarkets()
          .then(results => (this.markets = results));
        break;
      }
      case 'externalIdentifiers': {
        this.accountService
          .getAdminAccounts()
          .then(results => (this.accounts = results));
        this.admins = _.filter(this.clientConnectivities, [
          'entityType',
          'ADMIN'
        ]);
        this.custodians = _.filter(this.clientConnectivities, [
          'entityType',
          'PB'
        ]);
        break;
      }
      case 'customAttributes': {
        break;
      }
      default: {
      }
    }
  }

  private setRowData(tab: string, assetType: string): void {
    switch (tab) {
      case 'securityInformation': {
        if (this.assetType === 'claim') {
          this.securitiesLogs.then(securitiesLogs => {
            this.rowData = _.orderBy(
              this.formatAssetlogs(securitiesLogs, tab, assetType),
              ['fieldName', x => x.logTime.getTime()],
              ['asc', 'desc']
            );
          });
        } else {
          Promise.all([this.securitiesLogs, this.assetLogs]).then(results => {
            const [securitiesLogs, assetLogs] = results;
            this.rowData = _.orderBy(
              this.formatAssetlogs(
                securitiesLogs.concat(assetLogs),
                tab,
                assetType
              ),
              ['fieldName', x => x.logTime.getTime()],
              ['asc', 'desc']
            );
          });
        }
        break;
      }
      case 'additionalInformation': {
        this.assetLogs.then(logs => {
          this.rowData = _.orderBy(
            this.formatAssetlogs(logs, tab, assetType),
            ['fieldName', x => x.logTime.getTime()],
            ['asc', 'desc']
          );
        });
        break;
      }
      case 'publicIdentifiers': {
        this.securityIdentifierLogs.then(logs => {
          this.rowData = this.formatPublicIdentifiers(logs);
        });
        break;
      }
      case 'externalIdentifiers': {
        Promise.all([
          this.externalAdminIdentifierLogs,
          this.externalPublicIdentifierLogs
        ]).then(results => {
          const [adminIdentifierLogs, pbIdentifierLogs] = results;
          this.rowData = this.formatExtPublicIdentifiersLog(pbIdentifierLogs);
          this.adminRowData = this.formatExtAdminIdentifiersLog(
            adminIdentifierLogs
          );
        });
        break;
      }
      case 'customAttributes': {
        this.customAttributeLogs.then(logs => {
          this.rowData = this.formatCustomAttributes(logs);
        });
        break;
      }
      default: {
        this.rowData = [];
      }
    }
  }
}

export class SecurityHistory {
  constructor(
    public fieldName: string,
    public value: any,
    public logTime: Date,
    public User: string
  ) {}
}

export class IdentifiersHistory {
  public action: string;
  public marketId: string;
  public identifierId: any;
  public identifierType: string;
  public startDate: string;
  public endDate: string;
  public logTime: Date;
  public user: string;
}

export class ExtAdminIdsHistory {
  public action: string;
  public account: string;
  public endDate: string;
  public identifierType: string;
  public identifier: string;
  public logTime: Date;
  public startDate: string;
  public trs: boolean;
  public user: string;
}

export class ExtPublicIdsHistory {
  public action: string;
  public identifierType: string;
  public identifier: string;
  public logTime: Date;
  public user: string;
}
