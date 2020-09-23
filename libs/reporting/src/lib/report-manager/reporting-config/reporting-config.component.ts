import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { TreeModel, TreeNode } from 'angular-tree-component';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

import {
  Currency,
  ClientReportColumn,
  ReportColumn,
  ReportingColumn,
  UserReportColumn,
  UserReportCustomAttribute,
  UserReportIdcColumn,
  CustomAttribute
} from '@pnkl-frontend/shared';

@Component({
  selector: 'reporting-config',
  templateUrl: './reporting-config.component.html',
  animations: [
    trigger('visibleChanged', [
      state('1', style({ transform: 'translateX(-166.5%)' })),
      state('0', style({ transform: 'translateX(0)' })),
      transition('* => *', animate('800ms'))
    ])
  ]
})
export class ReportingConfigComponent implements OnDestroy, OnInit {
  @Input() configVisible = false;
  @Input() currencies: Currency[];
  @Input() idcColumns: any;
  @Input() private clientReportColumns: ClientReportColumn[];
  @Input() private customAttributes: CustomAttribute[];
  @Input() public importantColumnNames: string[];
  @Input() private isUserReport: boolean;
  @Input() private reportColumns: ReportColumn[];
  @Input() private savedColumns: ReportingColumn[];
  @Input() private userReportColumns: UserReportColumn[];
  @Input() private userReportCustomAttributes: UserReportCustomAttribute[];
  @Input() private userReportIdcColumns: UserReportIdcColumn[];

  @Output() columnsSelected = new EventEmitter<ReportingColumn[]>();
  @Output() currencySelected = new EventEmitter<Currency>();

  confirmationVisible = false;
  columnToMove: ReportingColumn;
  currencySelectionForm: FormGroup;
  currencySubscription: Subscription;
  idcColumnsSearchText = '';
  isCrcyDropDownVisible = false;
  pinnaklColumnsSearchText = '';
  selectableColumns: ReportingColumn[] = [];
  selectedColumns: ReportingColumn[] = [];
  selectedIdcColumns: ReportingColumn[] = [];

  get filteredSelectableColumns(): ReportingColumn[] {
    return !this.pinnaklColumnsSearchText
      ? this.selectableColumns
      : this.selectableColumns.filter(col =>
          col.caption
            .toLowerCase()
            .includes(this.pinnaklColumnsSearchText.toLowerCase())
        );
  }

  constructor(private fb: FormBuilder) {}

  isImportantColumn(column: ReportingColumn): boolean {
    return _.includes(this.importantColumnNames, column.name.toLowerCase());
  }

  moveAllColumns(fromSelectable: boolean): void {
    let from = '',
      to = '';
    if (fromSelectable) {
      from = 'selectableColumns';
      to = 'selectedColumns';
    } else {
      from = 'selectedColumns';
      to = 'selectableColumns';
    }
    for (let col of this[from]) {
      if (fromSelectable) {
        col.include = true;
      }
      this[to].push(col);
    }
    this[from] = [];
    this.updateColumns();
  }

  moveColumnAndShowConfirmAction(
    column: ReportingColumn,
    fromSelectable: boolean
  ): void {
    if (this.isImportantColumn(column)) {
      this.columnToMove = column;
      this.confirmationVisible = true;
    } else {
      this.moveColumn(column, fromSelectable);
    }
  }

  moveColumn(column: ReportingColumn, fromSelectable: boolean): void {
    let collectionFrom: ReportingColumn[], collectionTo: ReportingColumn[];
    if (fromSelectable) {
      collectionFrom = this.selectableColumns;
      collectionTo = this.selectedColumns;
      column.include = true;
    } else {
      collectionFrom = this.selectedColumns;
      collectionTo = this.selectableColumns;
    }
    let i = collectionFrom.indexOf(column);
    collectionFrom.splice(i, 1);
    collectionTo.push(column);
    this.updateColumns();
  }

  ngOnInit(): void {
    this.currencySelectionForm = this.fb.group({
      currency: [_.find(this.currencies, { currency: 'USD' })]
    });
    this.currencySubscription = this.currencySelectionForm.controls.currency.valueChanges.subscribe(
      (currency: Currency) => {
        this.currencySelected.emit(currency);
      }
    );
    this.setColumns();
  }

  ngOnDestroy(): void {
    this.currencySubscription.unsubscribe();
  }

  removeAllIdcColumns(): void {
    this.selectedIdcColumns = [];
    this.updateIdcColumns();
  }

  removeIdcColumn(column: ReportingColumn): void {
    let i = this.selectedIdcColumns.indexOf(column);
    this.selectedIdcColumns.splice(i, 1);
    this.updateIdcColumns();
  }

  searchIdcColumns(searchText: string, treeModel: TreeModel): void {
    treeModel.filterNodes(searchText, true);
  }

  selectIdcColumn(event: { node: TreeNode }): void {
    let { node: idcColumn } = event;
    if (idcColumn.hasChildren) {
      return;
    }
    let columnName = idcColumn.displayField,
      pinnaklColumnName = this.getFullColumnName(idcColumn);
    if (_.some(this.selectedIdcColumns, { name: pinnaklColumnName })) {
      return;
    }
    this.addIdcColumn(columnName, pinnaklColumnName);
  }

  private addIdcColumn(columnName: string, pinnaklColumnName: string): void {
    let rc = new ReportingColumn();
    rc.caption = columnName;
    rc.include = true;
    rc.name = pinnaklColumnName.replace(/ /g, '_').toLowerCase();
    rc.reportingColumnType = 'idc';
    rc.type = 'text';
    this.selectedIdcColumns.push(rc);
    this.updateIdcColumns();
  }

  private getCustomAttributes(
    attributes: CustomAttribute[]
  ): ReportingColumn[] {
    return !attributes
      ? []
      : attributes.map(ca => {
          let col = new ReportingColumn();
          col.caption = ca.name;
          col.name = ca.name;
          col.reportingColumnType = 'ca';
          col.type =
            ca.type === 'Number'
              ? 'numeric'
              : ca.type === 'List'
              ? 'text'
              : ca.type;
          return col;
        });
  }

  private getFullColumnName(column: TreeNode): string {
    let currentColumn = column,
      pinnaklColumnName = '';
    while (currentColumn.parent) {
      pinnaklColumnName = `${currentColumn.displayField}.${pinnaklColumnName}`;
      currentColumn = currentColumn.parent;
    }
    pinnaklColumnName = pinnaklColumnName.slice(0, -1);
    return pinnaklColumnName;
  }

  private getReportColumns(
    columns: (ReportColumn | ClientReportColumn | UserReportColumn)[]
  ): ReportingColumn[] {
    return !columns
      ? []
      : (columns as ReportColumn[]).map(rc => {
          let col = new ReportingColumn();
          col.caption = rc.caption;
          col.convertToBaseCurrency = rc.convertToBaseCurrency;
          col.name = rc.name;
          col.reportingColumnType = 'report';
          col.type = rc.type;
          col.decimalPlaces = rc.decimalPlaces;
          col.isAggregating = rc.isAggregating;
          col.renderingFunction = rc.renderingFunction;
          return col;
        });
  }

  private setClientReportColumns(): void {
    this.selectedColumns = _.cloneDeep(this.savedColumns);
    if (!(this.clientReportColumns && this.clientReportColumns.length > 0)) {
      this.selectableColumns = this.getCustomAttributes(this.customAttributes);
    } else {
      let customAttributes = this.getCustomAttributes(this.customAttributes),
        remainingReportColumns = this.getReportColumns(
          this.reportColumns.filter(
            rc => !_.some(this.clientReportColumns, { name: rc.name })
          )
        );
      this.selectableColumns = customAttributes.concat(remainingReportColumns);
    }
    this.updateColumns();
  }

  private setColumns(): void {
    if (this.isUserReport) {
      this.setUserReportColumns();
      return;
    }
    this.setClientReportColumns();
  }

  private setUserReportColumns(): void {
    this.selectedColumns = _.reject(_.cloneDeep(this.savedColumns), {
      reportingColumnType: 'idc'
    });
    let reportColumnsExist =
        this.userReportColumns && this.userReportColumns.length > 0,
      customAttributesExist =
        this.userReportCustomAttributes &&
        this.userReportCustomAttributes.length > 0,
      idcColumnsExist =
        this.userReportIdcColumns && this.userReportIdcColumns.length > 0,
      selectableColumns: ReportingColumn[] = [];

    if (reportColumnsExist) {
      selectableColumns = this.getReportColumns(
        this.reportColumns.filter(
          rc => !_.some(this.userReportColumns, { name: rc.name })
        )
      );
    } else {
      selectableColumns = this.getReportColumns(this.reportColumns);
    }

    if (customAttributesExist) {
      selectableColumns = selectableColumns.concat(
        this.getCustomAttributes(
          this.customAttributes.filter(
            ca => !_.some(this.userReportCustomAttributes, { name: ca.name })
          )
        )
      );
    } else {
      selectableColumns = selectableColumns.concat(
        this.getCustomAttributes(this.customAttributes)
      );
    }

    this.selectableColumns = selectableColumns;
    this.updateColumns();

    if (idcColumnsExist) {
      this.selectedIdcColumns = _.filter(_.cloneDeep(this.savedColumns), {
        reportingColumnType: 'idc'
      });
      this.updateIdcColumns();
    }
  }

  private updateColumns(): void {
    this.selectableColumns = _.sortBy(this.selectableColumns, ['caption']);
    this.selectedColumns = _.sortBy(this.selectedColumns, ['caption']);
    this.isCrcyDropDownVisible =
      _.filter(this.selectedColumns, 'convertToBaseCurrency').length > 0 &&
      this.currencies !== undefined;
    this.columnsSelected.emit(
      _(this.selectedColumns)
        .concat(this.selectedIdcColumns)
        .sortBy('caption')
        .value()
    );
  }

  private updateIdcColumns(): void {
    this.selectedIdcColumns = _.sortBy(this.selectedIdcColumns, ['caption']);
    this.columnsSelected.emit(
      _(this.selectedColumns)
        .concat(this.selectedIdcColumns)
        .sortBy('caption')
        .value()
    );
  }
}
