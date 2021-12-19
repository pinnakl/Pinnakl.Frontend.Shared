import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { TreeModel, TreeNode } from 'angular-tree-component';

import * as _ from 'lodash';

import {
  IdcColumn,
  IdcColumnsObject,
  ReportingColumn
} from '@pnkl-frontend/shared';

@Component({
  selector: 'available-idc-columns',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './available-idc-columns.component.html',
  styleUrls: ['./available-idc-columns.component.scss']
})
export class AvailableIdcColumnsComponent {
  @Input()
  private set allIdcColumns(columns: IdcColumn[]) {
    this._allIdcColumns = columns;
    this.idcColumns = this.createTreeForIdcColumns(columns).tree;
  }

  @Input() selectedIdcColumns: ReportingColumn[];

  @Output() columnsAdded = new EventEmitter<ReportingColumn[]>();

  idcColumns: any;
  idcColumnsSearchText = '';

  private _allIdcColumns: IdcColumn[] = [];

  constructor() {}

  searchIdcColumns(searchText: string, treeModel: TreeModel): void {
    treeModel.filterNodes(searchText, true);
  }

  selectIdcColumn(event: { node: TreeNode }): void {
    const { node: idcColumn } = event;
    if (idcColumn.hasChildren) {
      return;
    }
    const columnName = idcColumn.displayField,
      pinnaklColumnName = this.getFullColumnName(idcColumn)
        .replace(/ /g, '_')
        .toLowerCase();
    if (_.some(this.selectedIdcColumns, { name: pinnaklColumnName })) {
      return;
    }
    const { id, pnklColumnName } = this._allIdcColumns.find(
      col => col.pnklColumnName === pinnaklColumnName
    );
    this.columnsAdded.emit([
      this.getIdcReportingColumn(columnName, id, pnklColumnName)
    ]);
  }

  private createTreeForIdcColumns(idcColumns: IdcColumn[]): IdcColumnsObject {
    const updatedIdcColumns = idcColumns.map(idcColumn => new IdcColumn(
        idcColumn.id,
        idcColumn.idcColumnName,
        idcColumn.idcColumnName
          .split('.')
          .map(key =>
            key
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
          )
          .join('.')
      ));
    const tree = {};
    updatedIdcColumns.forEach(idcColumn =>
      _.set(tree, idcColumn.pnklColumnName, undefined)
    );
    const treeArray = [];
    createKendoTree(tree, treeArray, Object.keys(tree), 0);

    return new IdcColumnsObject(updatedIdcColumns, treeArray);

    function createKendoTree(
      obj: any,
      kendoTree: any[],
      allKeys: string[],
      currentKeyIndex: number
    ): void {
      if (currentKeyIndex >= allKeys.length) {
        return;
      }
      const currentKey = allKeys[currentKeyIndex],
        kendoTreeItem = {
          name: currentKey
        } as { name: string; children: any[] },
        value = obj[currentKey];
      if (value) {
        kendoTreeItem.children = [];
        createKendoTree(value, kendoTreeItem.children, Object.keys(value), 0);
      }
      kendoTree.push(kendoTreeItem);
      createKendoTree(obj, kendoTree, allKeys, currentKeyIndex + 1);
    }
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

  private getIdcReportingColumn(
    columnName: string,
    id: number,
    pinnaklColumnName: string
  ): ReportingColumn {
    const rc = new ReportingColumn();
    rc.caption = columnName;
    rc.dbId = id;
    rc.include = true;
    rc.name = pinnaklColumnName;
    rc.reportingColumnType = 'idc';
    rc.type = 'text';
    return rc;
  }
}
