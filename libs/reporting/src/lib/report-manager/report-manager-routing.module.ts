import { Injectable, NgModule } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterModule,
  Routes
} from '@angular/router';

import {
  CustomAttributesService,
  ClientReportColumnService,
  IdcColumnsService,
  OMSService,
  ReportColumnService,
  ReportingService,
  RouteResolverComponent,
  UserReportColumnService,
  UserReportCustomAttributeService,
  UserReportIdcColumnService
} from '@pnkl-frontend/shared';

import { ReportManagerResolvedData } from '../shared/report-manager-resolved-data.model';
import { ReportManagerComponent } from './report-manager.component';

@Injectable()
export class ReportingManagerResolve
  implements Resolve<Promise<ReportManagerResolvedData>> {
  constructor(
    private clientReportColumnService: ClientReportColumnService,
    private customAttributesService: CustomAttributesService,
    private omsService: OMSService,
    private idcColumnsService: IdcColumnsService,
    private reportColumnService: ReportColumnService,
    private reportingService: ReportingService,
    private userReportColumnService: UserReportColumnService,
    private userReportCustomAttributeService: UserReportCustomAttributeService,
    private userReportIdcColumnService: UserReportIdcColumnService
  ) {}
  resolve(route: ActivatedRouteSnapshot): Promise<ReportManagerResolvedData> {
    let {
        id: idString,
        name,
        clientReportId: clientReportIdString,
        userReportId: userReportIdString
      } = route.params as {
        id: string;
        name: string;
        clientReportId: string;
        userReportId: string;
      },
      id = parseInt(idString),
      clientReportId = parseInt(clientReportIdString),
      userReportId =
        userReportIdString && userReportIdString !== 'null'
          ? parseInt(userReportIdString)
          : null,
      reportManagerResolvedData: ReportManagerResolvedData;
    console.log({
      id: idString,
      name,
      clientReportId: clientReportIdString,
      userReportId: userReportIdString
    });
    return Promise.all([
      !userReportId
        ? this.clientReportColumnService.getClientReportColumns(clientReportId)
        : null,
      this.omsService.getCurrencies(),
      this.reportColumnService.getReportColumns(id),
      this.reportingService.getReportParameters(id),
      userReportId
        ? this.userReportColumnService.getUserReportColumns(userReportId)
        : null
    ])
      .then(result => {
        console.log(result);
        const [
            clientReportColumns,
            curencies,
            reportColumns,
            reportParameters,
            userReportColumns
          ] = result,
          securityIdPresent = reportColumns.some(
            col => col.name.toLowerCase() === 'securityid'
          );
        reportManagerResolvedData = new ReportManagerResolvedData(
          clientReportColumns,
          clientReportId,
          curencies,
          null,
          null,
          reportColumns,
          id,
          name,
          reportParameters,
          userReportColumns,
          null,
          userReportId,
          null
        );
        if (!securityIdPresent) {
          return null;
        }
        return Promise.all([
          this.customAttributesService.getCustomAttributes(),
          this.idcColumnsService.getIdcColumnsObject(),
          userReportId
            ? this.userReportCustomAttributeService.getUserReportCustomAttributes(
                userReportId
              )
            : null,
          userReportId
            ? this.userReportIdcColumnService.getUserReportIdcColumns(
                userReportId
              )
            : null
        ]);
      })
      .then(result => {
        if (!result) {
          return reportManagerResolvedData;
        }
        let [
          customAttributes,
          idcColumns,
          userReportCustomAttributes,
          userReportIdcColumns
        ] = result;
        reportManagerResolvedData.customAttributes = customAttributes;
        reportManagerResolvedData.idcColumns = idcColumns;
        reportManagerResolvedData.userReportCustomAttributes = userReportCustomAttributes;
        reportManagerResolvedData.userReportIdcColumns = userReportIdcColumns;
        return reportManagerResolvedData;
      });
  }
}

const routes: Routes = [
  {
    path: 'report-manager/:id/:name/:clientReportId/:userReportId',
    component: RouteResolverComponent,
    data: {
      headerClass: 'height-8',
      title: 'Loading Report',
      resolvingPath: 'reporting/report-manager-resolved'
    }
  },
  {
    path: 'report-manager-resolved',
    component: ReportManagerComponent,
    resolve: {
      resolvedData: ReportingManagerResolve
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ReportingManagerResolve]
})
export class ReportingManagerRoutingModule {}
