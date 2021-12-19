import { Injectable } from '@angular/core';

import * as _ from 'lodash';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { IdcColumnFromApi } from '../../models/reporting';
import { IdcColumn } from '../../models/reporting';
import { IdcColumnsObject } from '../../models/reporting';

@Injectable()
export class IdcColumnsService {
  private readonly RESOURCE_URL = 'entities/idc_reporting_columns';
  private _idcColumns: IdcColumn[];
  private _idcColumnsObject: IdcColumnsObject;

  constructor(private readonly wsp: WebServiceProvider) {}

  getIdcColumns(): Promise<IdcColumn[]> {
    if (this._idcColumns) {
      return Promise.resolve(this._idcColumns);
    }

    return this.wsp
      .getHttp<IdcColumnFromApi[]>({
        endpoint: this.RESOURCE_URL,
        params: {
          fields: ['id', 'idcColumnName', 'pnklColumnName', 'Type']
        }
      })
      .then(idcColumnsFromApi => idcColumnsFromApi.map(this.formatIdcColumn.bind(this)));
  }

  getIdcColumnsObject(): Promise<IdcColumnsObject> {
    if (this._idcColumnsObject) {
      return Promise.resolve(this._idcColumnsObject);
    }
    return this.getIdcColumns().then(idcColumns => {
      idcColumns.forEach(idcColumn => {
        idcColumn.pnklColumnName = idcColumn.idcColumnName
          .split('.')
          .map(key =>
            key
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
          )
          .join('.');
      });
      let tree = {};
      idcColumns.forEach(idcColumn =>
        _.set(tree, idcColumn.pnklColumnName, undefined)
      );
      let treeArray = [];
      createKendoTree(tree, treeArray, Object.keys(tree), 0);

      this._idcColumnsObject = new IdcColumnsObject(idcColumns, treeArray);
      return this._idcColumnsObject;

      function createKendoTree(
        obj: object,
        kendoTree: any[],
        allKeys: string[],
        currentKeyIndex: number
      ): void {
        if (currentKeyIndex >= allKeys.length) {
          return;
        }
        let currentKey = allKeys[currentKeyIndex],
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
    });
  }

  public formatIdcColumn(column: IdcColumnFromApi): IdcColumn {
    const id = parseInt(column.id, 10);
    return new IdcColumn(
      !isNaN(id) ? id : null,
      column.idccolumnname,
      column.pnklcolumnname
    );
  }
}
