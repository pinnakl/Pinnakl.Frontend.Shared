import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { UserService } from '@pnkl-frontend/core';

import * as _ from 'lodash';

import { ReportGroup } from '../shared/report-group.model';

@Component({
  selector: 'all-reports',
  templateUrl: 'all-reports.component.html',
  styleUrls: ['./all-reports.component.scss']
})
export class AllReportsComponent {
  reportGroups: ReportGroup[];
  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService
  ) {
    let { reportGroups } = this.activatedRoute.snapshot.data as {
      reportGroups: ReportGroup[];
    };
    reportGroups.sort((a, b) => {
      if (a.reportCategory.toLowerCase() === 'positions') {
        return -1;
      }
      if (b.reportCategory.toLowerCase() === 'positions') {
        return 1;
      }
      if (a.reportCategory.toLowerCase() === 'trades') {
        return -1;
      }
      if (b.reportCategory.toLowerCase() === 'trades') {
        return 1;
      }
      return 0;
    });

    const user = this.userService.getUser();
    if ([8, 10].includes(user.clientId)) {
      reportGroups = _.filter(reportGroups, {
        reportCategory: 'CRM'
      });
    }

    reportGroups.forEach(rg => {
      rg.clientReportList = _.sortBy(rg.clientReportList, 'reportName');
      rg.userReportList = _.sortBy(rg.userReportList, 'reportName');
    });
    this.reportGroups = reportGroups;
  }
}
