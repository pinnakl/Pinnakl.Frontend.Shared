import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { getBooleanFromString } from '@pnkl-frontend/core';
import {
  Account,
  AccountingService,
  AccountService,
  AUM,
  CashBalance,
  ClientReportColumn,
  ClientReportColumnService,
  CurrencyForOMS,
  CustomAttribute,
  CustomAttributeListOption,
  CustomAttributesService,
  DynamicEntity,
  IdcColumn,
  IdcColumnsService,
  LoadAccountsAum,
  LoadAccountsWithoutAum,
  LoadCashBalance,
  LoadCurrencies,
  LoadFullAum,
  LoadTradeWorkflowSpecs,
  OMSService,
  PositionsLoadAllDataService,
  PositionsPnlValueModel,
  RebalanceConfigModel,
  RebalanceConfigModelFromApi,
  ReportColumn,
  ReportColumnService,
  ReportingService,
  ReportParameter,
  SecurityPrice,
  TradeWorkflowSpec,
  TradeWorkflowSpecFromApi,
  UserReportColumn,
  UserReportColumnService,
  UserReportCustomAttribute,
  UserReportCustomAttributeService,
  UserReportIdcColumn,
  UserReportIdcColumnService
} from '@pnkl-frontend/shared';
import { groupBy } from 'lodash';
import { concatMap, switchMap } from 'rxjs/operators';
import { AttemptLoadSecurities } from '../../../../securities/securities-backend-state/store/security';
import { PositionsReportDataService } from '../../../positions-backend/positions-report-data/positions-report-data.service';
import { PositionsReportInfo } from '../../../positions-backend/positions-report-info/positions-report-info.model';
import { PortfolioStatusStreamService } from '../../../positions-backend/real-time/portfolio-status-stream/portfolio-status-stream.service';
import { SetSelectedAccountsWithoutAum } from '../../../positions-ui-state/store/positions-home-summary-selected-account/positions-home-summary-selected-account.actions';
import { PositionHomeService } from '../../../positions-ui/position-home/position-home.service';
import { LoadCustomAttributes } from '../custom-attribute/custom-attribute.actions';
import { LoadIdcColumns } from '../idc-column/idc-column.actions';
import { LoadPositionReportInfo } from '../position-report-info/position-report-info.actions';
import { InitializePnlValues } from '../positions-pnl-values/positions-pnl-values.actions';
import { LoadPositionsReportData } from '../positions-report-data/positions-report-data.actions';
import { AttemptLoadAllData, SetIsAllDataLoaded } from './all-data.actions';

@Injectable()
export class AllDataEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(AttemptLoadAllData),
    concatMap(async () => {
      const [response, aums] = await Promise.all([
        await this.allDataService.getAllData(),
        await this.accountingService.getAllAUM()
      ]);

      this.positionsHomeService.pmsRebalanceConfig$.next(
        this.formatRebalanceConfig(this.getEntities<any>(response, 'pms_rebalance_config')[0])
      );

      const accounts = this.getEntities<Account>(
        response,
        'accounts',
        this.accountService.formatAccount
      );

      // TODO: POSITION PNL CHART
      const primaryAccount = accounts.find(acc => acc.isPrimaryForReturns);
      const positionsPnlValuesPrimary = this.getEntities<PositionsPnlValueModel>(
        response,
        'intraday_pl',
        value => ({
          id: +value.id,
          plVal: Math.round(+value.pl * 100) / 100,
          // Round up to 4 digits after decimal
          plPct: Math.round(+value.pl / aums.find(a => a.accountId === +primaryAccount.id)?.aum * 1000000) / 10000,
          date: new Date(`${value.timestamp} Z`),
          accountId: +value.accountid
        })
        // TODO: Remove filter by 5th element
      ).filter(value => value.accountId === +primaryAccount.id).filter(val => val.date.getMinutes() % 5 === 0);


      const positionsPnlValuesBenchmark = this.getEntities<PositionsPnlValueModel>(
        response,
        'benchmark_index_intraday_prices',
        value => ({
          id: +value.id,
          plVal: null, // Math.round(+value.price * 100) / 100
          // Round up to 4 digits after decimal
          plPct: +value.intradayreturn,
          date: new Date(`${value.timestamp} Z`),
          accountId: value.benchmarkindex
        })
        // TODO: Remove filter by 5th element
      ).filter(val => val.date.getMinutes() % 5 === 0);

      const groupedPositionsPnlValuesBenchmark = groupBy(positionsPnlValuesBenchmark, 'accountId');

      const positionsPnlValues = [];
      for (const key in groupedPositionsPnlValuesBenchmark) {
        positionsPnlValues.push({ name: key.toUpperCase(), data: groupedPositionsPnlValuesBenchmark[key] });
      }

      positionsPnlValues.unshift({ name: 'Account P&L', data: positionsPnlValuesPrimary });

      const cashBalances = this.getEntities<CashBalance>(
        response,
        'account_cash',
        this.accountingService.formatCashBalance
      );
      const currencies = this.getEntities<CurrencyForOMS>(
        response,
        'global_currencies',
        this.omsService.formatCurrency
      );
      const tradeWorkflowSpecs = this.getEntities<TradeWorkflowSpec>(
        response,
        'trade_workflow_specs',
        this.formatTradeWorkflowSpec
      );
      const idcReportingColumns = this.getEntities<IdcColumn>(
        response,
        'idc_reporting_columns',
        this.idcService.formatIdcColumn
      );
      const reportInfo = {
        clientReportColumns: this.getEntities<ClientReportColumn>(
          response,
          'client_report_columns',
          this.clientReportColumnService.formatClientReportColumn.bind(
            this.clientReportColumnService
          )
        ),
        reportColumns: this.getEntities<ReportColumn>(
          response,
          'report_columns',
          this.reportColumnService.formatReportColumn.bind(
            this.reportColumnService
          )
        ),
        reportParameters: this.getEntities<ReportParameter>(
          response,
          'report_parameters',
          this.reportingService.formatReportParameter.bind(
            this.reportingService
          )
        ),
        userReportColumns: this.getEntities<UserReportColumn>(
          response,
          'user_report_columns',
          this.userReportColumnService.formatUserReportColumn.bind(
            this.userReportColumnService
          )
        ),
        userReportCustomAttrColumns: this.getEntities<
          UserReportCustomAttribute
        >(
          response,
          'user_report_custom_attributes',
          this.userReportCustomAttrService.formatUserReportCustomAttribute.bind(
            this.userReportCustomAttrService
          )
        ),
        userReportIDCColumns: this.getEntities<UserReportIdcColumn>(
          response,
          'user_report_idc_columns',
          this.userReportIdcColumnService.formatUserReportIdcColumn.bind(
            this.userReportIdcColumnService
          )
        ),
        securityPrices: this.getEntities<SecurityPrice>(
          response,
          'security_prices',
          entity => ({
            priceType: entity.priceType,
            securityId: parseInt(entity.securityid, 10),
            price: parseFloat(entity.price)
          })
        )
      };

      const securityCustomAttributes = this.getEntities<CustomAttribute>(
        response,
        'security_custom_attributes',
        this.customAttributeService.formatCustomAttribute
      );
      const securityCustomAttributesListOptions = this.getEntities<
        CustomAttributeListOption
      >(
        response,
        'security_custom_attribute_list_options',
        this.customAttributeService.formatCustomAttributeListOption
      );

      const fulfilledSecurityCustomAttributes = securityCustomAttributes.map(
        (attr): CustomAttribute => {
          if (attr.type.toLowerCase() !== 'list') {
            return attr;
          }
          return {
            ...attr,
            listOptions: securityCustomAttributesListOptions.filter(
              s => s.customAttributeId === attr.id
            )
          };
        }
      );

      const now = new Date();
      const additionalFields = {};
      reportInfo.reportColumns.forEach(col => {
        if (col.type === 'stream') {
          additionalFields[col.caption] = null;
        }
      });
      fulfilledSecurityCustomAttributes.forEach(col => {
        additionalFields[col.name] = null;
      });

      const portfolioStatuses = this.portfolioStatusStreamService.addCalculatedCost(
        this.getEntities<{
          SecurityId: number;
          Quantity: number;
          Cost: number;
        }>(response, 'portfolio_status', item => ({
          SecurityId: parseInt(item.securityid, 10),
          Quantity: parseInt(item.quantity, 10),
          Cost: parseFloat(item.cost)
        }))
      );

      const positionReport = this.getEntities<CustomAttributeListOption>(
        response,
        'position_report',
        item => ({
          ...item,
          cost:
            portfolioStatuses.find(
              p => parseInt(item.securityid, 10) === p.SecurityId
            )?.Cost || (item.assettype !== 'CASH' ? 0 : 1)
        })
      );

      const dataWithAdditionalFields = this.positionsReportDataService
        .combineReportDataWithAdditionalFields(positionReport, additionalFields)
        .map(x => ({
          ...x,
          Mark: x.AssetType === 'CASH' ? 1 : 0,
          Delta: x.AssetType === 'CASH' ? 1 : x.Delta,
          UndPrc: x.AssetType === 'CASH' ? 1 : x.UndPrc,
          pnlRealized: 0,
          pnlUnRealized: 0,
          UpdatedAt: now
        }));

      const positionsReportDataWithSecurityPrices = this.extendPositionReportDataWithSecurityPrices(
        dataWithAdditionalFields,
        reportInfo.securityPrices
      );

      return [
        accounts,
        cashBalances,
        currencies,
        tradeWorkflowSpecs,
        idcReportingColumns,
        this.addFormulaFieldFromReportColumns(reportInfo),
        aums,
        fulfilledSecurityCustomAttributes,
        positionsReportDataWithSecurityPrices,
        // TODO: POSITION PNL CHART
        positionsPnlValues
      ];
    }),
    switchMap(
      ([
        accounts,
        cashBalance,
        currencies,
        tradeWorkflowSpecs,
        idcColumns,
        positionsReportInfo,
        aums,
        customAttributes,
        positionsReportData,
        // TODO: POSITION PNL CHART
        positionsPnlValues
      ]: [
          Account[],
          CashBalance[],
          CurrencyForOMS[],
          TradeWorkflowSpec[],
          IdcColumn[],
          PositionsReportInfo,
          AUM[],
          CustomAttribute[],
          any,
          // TODO: POSITION PNL CHART
          PositionsPnlValueModel[]
        ]) => [
          SetIsAllDataLoaded({ payload: true }),
          LoadAccountsWithoutAum({ accounts }),
          aums.length && LoadFullAum(aums[aums.length - 1]),
          SetSelectedAccountsWithoutAum({ payload: accounts }),
          LoadCashBalance({ cashBalance }),
          LoadCurrencies({ currencies }),
          LoadTradeWorkflowSpecs({ tradeWorkflowSpecs }),
          LoadIdcColumns({ idcColumns }),
          LoadPositionReportInfo({ positionsReportInfo }),
          LoadAccountsAum({ payload: aums }),
          LoadCustomAttributes({ customAttributes }),
          LoadPositionsReportData({ positionsReportData }),
          AttemptLoadSecurities(),
          // TODO: POSITION PNL CHART
          InitializePnlValues({ payload: positionsPnlValues, accountId: +accounts.find(acc => acc.isPrimaryForReturns)?.id })
        ]
    )
  ));

  constructor(
    private readonly actions$: Actions,
    private readonly omsService: OMSService,
    private readonly idcService: IdcColumnsService,
    private readonly accountService: AccountService,
    private readonly reportingService: ReportingService,
    private readonly accountingService: AccountingService,
    private readonly reportColumnService: ReportColumnService,
    private readonly positionsHomeService: PositionHomeService,
    private readonly allDataService: PositionsLoadAllDataService,
    private readonly customAttributeService: CustomAttributesService,
    private readonly userReportColumnService: UserReportColumnService,
    private readonly clientReportColumnService: ClientReportColumnService,
    private readonly positionsReportDataService: PositionsReportDataService,
    private readonly userReportIdcColumnService: UserReportIdcColumnService,
    private readonly portfolioStatusStreamService: PortfolioStatusStreamService,
    private readonly userReportCustomAttrService: UserReportCustomAttributeService
  ) { }

  private getEntities<T>(
    dynamicEntities: DynamicEntity[],
    pnkl_type: string,
    formatter?: (entity: any) => any
  ): T[] {
    return formatter
      ? dynamicEntities.filter(e => e.pnkl_type === pnkl_type).map(formatter)
      : dynamicEntities.filter(e => e.pnkl_type === pnkl_type);
  }

  private addFormulaFieldFromReportColumns(
    positionsReportInfo: PositionsReportInfo
  ): PositionsReportInfo {
    return {
      ...positionsReportInfo,
      userReportColumns: positionsReportInfo.userReportColumns.map(c => {
        const reportColumn = positionsReportInfo.reportColumns.find(
          rc =>
            rc.formula != null &&
            rc.formula !== '' &&
            rc.id === c.reportColumnId
        );
        if (reportColumn) {
          c.formula = reportColumn.formula;
        }
        return c;
      })
    };
  }

  private formatTradeWorkflowSpec({
    id,
    calcaum,
    clientid,
    listedexecution,
    manualapproval,
    nonlistedfills,
    realtimeportfolio,
    rebalancebpsadjvisible
  }: TradeWorkflowSpecFromApi): TradeWorkflowSpec {
    return {
      clientId: +clientid,
      id: +id,
      calcAum: calcaum === 'True',
      manualApproval: manualapproval === 'True',
      nonlistedFills: nonlistedfills === 'True',
      listedExecution: listedexecution === 'True',
      realTimePortfolio: realtimeportfolio === 'True',
      rebalanceBpsAdjVisible: rebalancebpsadjvisible === 'True'
    };
  }

  private extendPositionReportDataWithSecurityPrices(
    data: any[],
    secPrices: SecurityPrice[]
  ): any[] {
    data = data.map(d => {
      const item = { ...d };

      const relatedSecurityPrices = secPrices.filter(
        s => s.securityId === d.SecurityId
      );
      const mid = relatedSecurityPrices.find(r => r.priceType === 'mid');
      const delta = relatedSecurityPrices.find(r => r.priceType === 'delta');
      const undPrc = relatedSecurityPrices.find(r => r.priceType === 'undprc');

      if (mid) {
        item.Mark = mid.price;
      }
      if (delta) {
        item.Delta = delta.price;
      }
      if (undPrc) {
        item.UndPrc = undPrc.price;
      }

      // We are doing this so DeltaAdjExposure can be calculated for equities.
      // Backend is not sending Delta and UndPrice for equities
      if (!['option', 'cash'].includes(item.AssetType.toLowerCase())) {
        item.Delta = 1;
        item.UndPrc = mid?.price;
      }

      return item;
    });

    return data;
  }

  private formatRebalanceConfig(rebalanceConfigFromApi: RebalanceConfigModelFromApi): RebalanceConfigModel {
    return rebalanceConfigFromApi ? {
      BPSPctVisible: getBooleanFromString(rebalanceConfigFromApi.bpspctvisible),
      EquityCommAssumption: +rebalanceConfigFromApi.equitycommassumption,
      OptionCommAssumption: +rebalanceConfigFromApi.optioncommassumption,
      EquityBrokerId: +rebalanceConfigFromApi.equitybrokerid,
      OptionBrokerId: +rebalanceConfigFromApi.optionbrokerid
    } : null;
  }
}
