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
  UserReportIdcColumnService,
  CustomAttributeFeature
} from '@pnkl-frontend/shared';

import { ReportManagerResolvedData } from '../shared/report-manager-resolved-data.model';
import { ReportManagerComponent } from './report-manager.component';

@Injectable()
export class ReportingManagerResolve
  implements Resolve<Promise<ReportManagerResolvedData>> {
  constructor(
    private readonly clientReportColumnService: ClientReportColumnService,
    private readonly customAttributesService: CustomAttributesService,
    private readonly omsService: OMSService,
    private readonly idcColumnsService: IdcColumnsService,
    private readonly reportColumnService: ReportColumnService,
    private readonly reportingService: ReportingService,
    private readonly userReportColumnService: UserReportColumnService,
    private readonly userReportCustomAttributeService: UserReportCustomAttributeService,
    private readonly userReportIdcColumnService: UserReportIdcColumnService
  ) { }
  async resolve(route: ActivatedRouteSnapshot): Promise<ReportManagerResolvedData> {
    const {
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
      id = parseInt(idString, 10),
      clientReportId = parseInt(clientReportIdString, 10),
      userReportId =
        userReportIdString && userReportIdString !== 'null'
          ? parseInt(userReportIdString, 10)
          : null;
    let reportManagerResolvedData: ReportManagerResolvedData;

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
        const [
            clientReportColumns,
            curencies,
            reportColumns,
            reportParameters,
            userReportColumns
          ] = result,
          securityIdPresent = !!reportColumns.find(
            col => col.name.toLowerCase() === 'securityid'
          ),
          investorIdPresent = !!reportColumns.find(
            col => col.name.toLowerCase() === 'organizationid'
          ),
          contactIdPresent = !!reportColumns.find(
            col => col.name.toLowerCase() === 'contactid'
          );
        let featureName: CustomAttributeFeature = null;
        if (securityIdPresent) {
          featureName = CustomAttributeFeature.SECURITY;
        } else if (investorIdPresent) {
          featureName = CustomAttributeFeature.ORGANIZATION;
        } else if (contactIdPresent) {
          featureName = CustomAttributeFeature.CONTACT;
        }

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
        if (!featureName) {
          return null;
        }
        return Promise.all([
          this.customAttributesService.getCustomAttributes(featureName),
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
        const [
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
