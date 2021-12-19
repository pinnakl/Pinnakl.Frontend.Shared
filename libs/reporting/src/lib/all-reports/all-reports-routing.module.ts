import { Injectable, NgModule } from '@angular/core';
import { Resolve, RouterModule, Routes } from '@angular/router';

import * as _ from 'lodash';

import { UserService } from '@pnkl-frontend/core';
import {
  ClientReport,
  ClientReportService,
  RouteResolverComponent,
  UserReport,
  UserReportService
} from '@pnkl-frontend/shared';
import { ReportGroup } from '../shared/report-group.model';
import { AllReportsComponent } from './all-reports.component';

@Injectable()
export class AllReportsResolve implements Resolve<Promise<ReportGroup[]>> {
  constructor(
    private readonly clientReportService: ClientReportService,
    private readonly userReportService: UserReportService,
    private readonly userService: UserService
  ) { }

  async resolve(): Promise<any> {
    return Promise.all([
      this.clientReportService.getClientReports(),
      this.userReportService.getUserReports(this.userService.getUser().id)
    ]).then(result => {
      const [clientReports, userReports] = result;
      return this.getReportGroups(
          _.filter(userReports, { isPnklInternal: false }),
          this.getReportGroups(
            _.filter(clientReports, { isPnklInternal: false }),
            []
          )
        )
    });
  }

  private getReportGroups(
    reports: (ClientReport | UserReport)[],
    groups: ReportGroup[]
  ): ReportGroup[] {
    return reports.reduce((reportGroups: ReportGroup[], report) => {
      const existingGroup = _.find(reportGroups, {
        reportCategory: report.reportCategory
      });
      if (report['userId']) {
        if (!existingGroup) {
          reportGroups.push(
            new ReportGroup(report.reportCategory, [], [<UserReport>report])
          );
        } else {
          existingGroup.userReportList.push(<UserReport>report);
        }
      } else {
        if (!existingGroup) {
          reportGroups.push(
            new ReportGroup(report.reportCategory, [report], [])
          );
        } else {
          existingGroup.clientReportList.push(report);
        }
      }
      return reportGroups;
    }, groups);
  }
}

const routes: Routes = [
  {
    path: 'all-reports',
    component: RouteResolverComponent,
    data: {
      title: 'Reporting',
      resolvingPath: 'reporting/all-reports-resolved'
    }
  },
  {
    path: 'all-reports-resolved',
    component: AllReportsComponent,
    resolve: {
      reportGroups: AllReportsResolve
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AllReportsResolve]
})
export class AllReportsRoutingModule {}
