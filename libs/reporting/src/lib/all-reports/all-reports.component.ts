import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { UserService } from '@pnkl-frontend/core';

import * as _ from 'lodash';
import { ProjectNames } from '../../../../shared/src';

import { ReportGroup } from '../shared/report-group.model';

@Component({
  selector: 'all-reports',
  templateUrl: 'all-reports.component.html',
  styleUrls: ['./all-reports.component.scss']
})
export class AllReportsComponent {
  reportGroups: ReportGroup[];
  projectName: string;
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly userService: UserService
  ) {
    let resolveData = (this.activatedRoute.snapshot.data as {
      reportGroups: ReportGroup[];
      projectName: string;
    });

    let reportGroups = resolveData.reportGroups;
    this.projectName = resolveData.projectName;

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
    if (this.projectName === ProjectNames.CRM) {
      reportGroups = _.filter(reportGroups, {
        reportCategory: 'CRM'
      });
    }

    reportGroups.forEach(rg => {
      rg.clientReportList = _.sortBy(rg.clientReportList, 'reportName');
      rg.userReportList = _.sortBy(rg.userReportList, 'reportName');
    });
    this.reportGroups = reportGroups;
    this.userService.validateUserResetPasswordModal();
  }
}
