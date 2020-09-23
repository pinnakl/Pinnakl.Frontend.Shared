import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { GridOptions } from 'ag-grid-community';
import * as _ from 'lodash';

import { PinnaklSpinner, Toastr, UserService } from '@pnkl-frontend/core';
import {
  CustomAttribute,
  IdcColumn,
  ReportColumn,
  ReportingColumn,
  ReportingHelper,
  UserReportColumn,
  UserReportCustomAttribute,
  UserReportIdcColumn,
  UserReport,
  UserReportColumnService,
  UserReportCustomAttributeService,
  UserReportIdcColumnService,
  UserReportService,
  Utility
} from '@pnkl-frontend/shared';

declare let $: any;

@Component({
  selector: 'user-report-save-manager',
  templateUrl: 'user-report-save-manager.component.html',
  styleUrls: ['user-report-save-manager.component.scss']
})
export class UserReportSaveManagerComponent {
  @Input() parentForm: string;
  @Input() saveOnly: boolean;
  showDropDownMenu = false;
  @Input() userReportId: number;
  @Input() private clientReportId: number;
  @Input() private customAttributes: CustomAttribute[];
  @Input() private filterColumns: ReportingColumn[];
  @Input() private gridOptions: GridOptions;
  hideSaveAsModal = true;
  @Input() private idcColumns: IdcColumn[];
  @Input() private reportColumns: ReportColumn[];
  @Input() private reportName: string;
  @Input() private reportId: number;
  @Input() private savedColumns: ReportingColumn[];

  constructor(
    private pinnaklSpinner: PinnaklSpinner,
    private reportingHelper: ReportingHelper,
    private router: Router,
    private toastr: Toastr,
    private userReportColumnService: UserReportColumnService,
    private userReportCustomAttributeService: UserReportCustomAttributeService,
    private userReportIdcColumnService: UserReportIdcColumnService,
    private userReportService: UserReportService,
    private userService: UserService,
    private utility: Utility
  ) {}

  save(): void {
    let entities = this.getCurrentColumns();
    if (!entities) {
      return;
    }
    if (this.parentForm === 'positions' && !this.userReportId) {
      return this.saveAs(this.reportName);
    }
    if (this.parentForm === 'pnl' && !this.userReportId) {
      return this.saveAs(this.reportName);
    }
    let existingEntities = this.savedColumns,
      savePromises = entities.reduce(
        (promises, entity) => {
          if (!entity.dbId) {
            promises.push(this.postColumn(entity, this.userReportId));
            return promises;
          }
          let existingEntity = _.find(existingEntities, {
              reportingColumnType: entity.reportingColumnType,
              dbId: entity.dbId
            }),
            updatedEntity = this.getUpdatedColumn(entity, existingEntity);
          if (updatedEntity) {
            promises.push(this.putColumn(updatedEntity));
          }
          return promises;
        },
        [] as Promise<any>[]
      ),
      deletePromises = existingEntities
        .filter(
          eE =>
            !_.some(entities, {
              reportingColumnType: eE.reportingColumnType,
              dbId: eE.dbId
            })
        )
        .map(eE => this.reportingHelper.deleteColumn(eE));
    let promises = deletePromises.concat(<any>savePromises);
    if (promises.length === 0) {
      this.toastr.info('No changes to update');
      return;
    }
    this.pinnaklSpinner.spin();
    Promise.all(promises)
      .then(() => {
        this.pinnaklSpinner.stop();
        this.toastr.success('Changes saved successfully');
        if (this.parentForm === 'positions') {
          this.router.navigate(['positions'], { skipLocationChange: true });
        } else if (this.parentForm === 'pnl') {
          this.router.navigate(['pnl/pnl-yearly'], {
            skipLocationChange: true
          });
        } else {
          this.router.navigate([
            'reporting/report-manager',
            this.reportId,
            this.reportName,
            this.clientReportId,
            this.userReportId
          ]);
        }
      })
      .catch(this.utility.errorHandler.bind(this));
  }

  toggleSaveAsModal(): void {
    this.hideSaveAsModal = !this.hideSaveAsModal;
  }

  saveAs(reportName: string): void {
    let columns = this.getCurrentColumns();
    if (!columns) {
      return;
    }
    let user = this.userService.getUser(),
      report = {
        clientReportId: this.clientReportId,
        isPnklInternal:
          this.parentForm === 'positions' || this.parentForm === 'pnl',
        reportName,
        reportId: this.reportId,
        userId: user.id
      } as UserReport;
    this.pinnaklSpinner.spin();
    this.userReportService
      .postUserReport(report)
      .then(savedReport => {
        let userReportId = savedReport.id,
          promises = columns.map(col => this.postColumn(col, userReportId));
        return Promise.all([savedReport].concat(<any>promises));
      })
      .then(result => {
        let [userReport] = result;
        this.toastr.success('Report saved successfully');
        this.pinnaklSpinner.stop();
        this.hideSaveAsModal = true;
        if (this.parentForm === 'positions') {
          this.router.navigate(['positions'], { skipLocationChange: true });
        } else if (this.parentForm === 'pnl') {
          this.router.navigate(['pnl/pnl-yearly'], {
            skipLocationChange: true
          });
        } else {
          this.router.navigate([
            'reporting/report-manager',
            userReport.reportId,
            userReport.reportName,
            userReport.clientReportId,
            userReport.id
          ]);
        }
      })
      .catch(() => {
        this.hideSaveAsModal = true;
        this.utility.showError(undefined);
      });
  }

  private addConfigProperties(
    col: UserReportColumn | UserReportCustomAttribute | UserReportIdcColumn,
    rc: ReportingColumn,
    userReportId?: number
  ): void {
    if (
      rc.reportingColumnType === 'report' &&
      rc.decimalPlaces !== null &&
      rc.decimalPlaces !== undefined
    ) {
      (<UserReportColumn>col).decimalPlaces = rc.decimalPlaces;
    }
    col.filterValues = rc.filters;
    col.groupOrder = rc.groupOrder;
    col.isAggregating = rc.isAggregating;
    col.sortAscending = rc.sortAscending;
    col.sortOrder = rc.sortOrder;
    col.viewOrder = rc.viewOrder;
    (<UserReportColumn>col).renderingFunction = rc.renderingFunction;
    if (userReportId) {
      col.userReportId = userReportId;
    }
  }

  private getCurrentColumns(): ReportingColumn[] {
    let columns = this.reportingHelper.getColumnsFromGridAndFilterToSave(
      this.filterColumns,
      this.gridOptions
    );
    if (columns.length === 0) {
      this.toastr.error('No columns selected');
      return null;
    }
    return columns;
  }

  private getUpdatedColumn(
    entity: ReportingColumn,
    existingEntity: ReportingColumn
  ): ReportingColumn {
    let updatedEntity = {} as ReportingColumn;
    let decimalPlaces = entity.decimalPlaces;
    if (
      !this.utility.compareNumeric(decimalPlaces, existingEntity.decimalPlaces)
    ) {
      updatedEntity.decimalPlaces = decimalPlaces;
    }
    let filters = entity.filters;
    if (!_.isEqual(filters, existingEntity.filters)) {
      updatedEntity.filters = filters;
    }
    let groupOrder = entity.groupOrder;
    if (!this.utility.compareNumeric(groupOrder, existingEntity.groupOrder)) {
      updatedEntity.groupOrder = groupOrder ? groupOrder : null;
    }
    let isAggregating = entity.isAggregating;
    if (isAggregating !== existingEntity.isAggregating) {
      updatedEntity.isAggregating = isAggregating;
    }
    let sortAscending = entity.sortAscending;
    if (sortAscending !== existingEntity.sortAscending) {
      updatedEntity.sortAscending = sortAscending;
    }
    let sortOrder = entity.sortOrder;
    if (!this.utility.compareNumeric(sortOrder, existingEntity.sortOrder)) {
      updatedEntity.sortOrder = sortOrder;
    }
    let viewOrder = entity.viewOrder;
    if (!this.utility.compareNumeric(viewOrder, existingEntity.viewOrder)) {
      updatedEntity.viewOrder = viewOrder;
    }
    if (_.isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.dbId = existingEntity.dbId;
    updatedEntity.reportingColumnType = existingEntity.reportingColumnType;
    updatedEntity.type = existingEntity.type;
    return updatedEntity;
  }

  private postColumn(
    col: ReportingColumn,
    userReportId: number
  ):
    | Promise<UserReportCustomAttribute>
    | Promise<UserReportIdcColumn>
    | Promise<UserReportColumn> {
    switch (col.reportingColumnType) {
      case 'ca': {
        let baseColumn = _.find(this.customAttributes, { name: col.name });
        if (!baseColumn) {
          throw new Error();
        }
        let columnToSave = {
          customAttributeId: baseColumn.id
        } as UserReportCustomAttribute;
        this.addConfigProperties(columnToSave, col, userReportId);
        return this.userReportCustomAttributeService.postUserReportCustomAttribute(
          columnToSave
        );
      }
      case 'idc': {
        let baseColumn = _.find(this.idcColumns, { idcColumnName: col.name });
        if (!baseColumn) {
          throw new Error();
        }
        let columnToSave = {
          idcColumnId: baseColumn.id
        } as UserReportIdcColumn;
        this.addConfigProperties(columnToSave, col, userReportId);
        return this.userReportIdcColumnService.postUserReportIdcColumn(
          columnToSave
        );
      }
      case 'report': {
        let baseColumn = _.find(this.reportColumns, { name: col.name });
        if (!baseColumn) {
          throw new Error();
        }
        let columnToSave = {
          reportColumnId: baseColumn.id
        } as UserReportColumn;
        this.addConfigProperties(columnToSave, col, userReportId);
        return this.userReportColumnService.postUserReportColumn(columnToSave);
      }
      default:
        throw new Error();
    }
  }

  private putColumn(
    col: ReportingColumn
  ):
    | Promise<UserReportCustomAttribute>
    | Promise<UserReportIdcColumn>
    | Promise<UserReportColumn> {
    switch (col.reportingColumnType) {
      case 'ca': {
        let columnToSave = { id: col.dbId } as UserReportCustomAttribute;
        this.addConfigProperties(columnToSave, col);
        return this.userReportCustomAttributeService.putUserReportCustomAttribute(
          columnToSave
        );
      }
      case 'idc': {
        let columnToSave = { id: col.dbId } as UserReportIdcColumn;
        this.addConfigProperties(columnToSave, col);
        return this.userReportIdcColumnService.putUserReportIdcColumn(
          columnToSave
        );
      }
      case 'report': {
        let columnToSave = { id: col.dbId } as UserReportColumn;
        this.addConfigProperties(columnToSave, col);
        return this.userReportColumnService.putUserReportColumn(columnToSave);
      }
      default:
        throw new Error();
    }
  }

  toggleDropdownMenu(): void {
    this.showDropDownMenu = !this.showDropDownMenu;
  }
}
