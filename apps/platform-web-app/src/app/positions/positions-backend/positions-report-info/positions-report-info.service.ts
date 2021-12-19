import { Injectable } from '@angular/core';
import { chain, find } from 'lodash';

import { WebServiceProvider } from '@pnkl-frontend/core';
import {
  ClientReportColumnService,
  DynamicEntity,
  ReportColumnService,
  ReportingService,
  UserReportColumnService,
  UserReportCustomAttributeService,
  UserReportIdcColumnService
} from '@pnkl-frontend/shared';
import { PositionsReportInfo } from './positions-report-info.model';

@Injectable({
  providedIn: 'root'
})
export class PositionsReportInfoService {
  private readonly _positionReportInfoEndpoint = 'entities/position_report_info';

  constructor(
    private readonly clientReportColumnService: ClientReportColumnService,
    private readonly reportColumnService: ReportColumnService,
    private readonly reportingService: ReportingService,
    private readonly userReportColumnService: UserReportColumnService,
    private readonly userReportCustomAttrService: UserReportCustomAttributeService,
    private readonly userReportIdcColumnService: UserReportIdcColumnService,
    private readonly wsp: WebServiceProvider
  ) {}

  async get(): Promise<PositionsReportInfo> {
    const reportInfo = await this.wsp.getHttp<DynamicEntity[]>({
      endpoint: this._positionReportInfoEndpoint
    });

    return {
      clientReportColumns: this.getEntities(
        reportInfo,
        'client_report_columns',
        this.clientReportColumnService.formatClientReportColumn.bind(
          this.clientReportColumnService
        )
      ),
      reportColumns: this.getEntities(
        reportInfo,
        'report_columns',
        this.reportColumnService.formatReportColumn.bind(
          this.reportColumnService
        )
      ),
      reportParameters: this.getEntities(
        reportInfo,
        'report_parameters',
        this.reportingService.formatReportParameter.bind(
          this.reportingService
        )
      ),
      userReportColumns: this.getEntities(
        reportInfo,
        'user_report_columns',
        this.userReportColumnService.formatUserReportColumn.bind(
          this.userReportColumnService
        )
      ),
      userReportCustomAttrColumns: this.getEntities(
        reportInfo,
        'user_report_custom_attributes',
        this.userReportCustomAttrService.formatUserReportCustomAttribute.bind(
          this.userReportCustomAttrService
        )
      ),
      userReportIDCColumns: this.getEntities(
        reportInfo,
        'user_report_idc_columns',
        this.userReportIdcColumnService.formatUserReportIdcColumn.bind(
          this.userReportIdcColumnService
        )
      )
    };
  }

  private getEntities(
    dynamicEntities: DynamicEntity[],
    pnkl_type: string,
    formatter: (entity: any) => any
  ): any[] {
    return chain(dynamicEntities)
      .filter({ pnkl_type })
      .map(entity => formatter(entity))
      .value();
  }

  private getEntity(
    dynamicEntities: DynamicEntity[],
    pnkl_type: string,
    formatter: (entity: any) => any
  ): any {
    const entity = find(dynamicEntities, { pnkl_type });
    return entity ? formatter(entity) : null;
  }
}
