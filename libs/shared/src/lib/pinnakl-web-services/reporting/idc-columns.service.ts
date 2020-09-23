import { Injectable } from '@angular/core';

import * as _ from 'lodash';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { IdcColumnFromApi } from '../../models/reporting/idc-column-from-api.model';
import { IdcColumn } from '../../models/reporting/idc-column.model';
import { IdcColumnsObject } from '../../models/reporting/idc-columns-object.model';

@Injectable()
export class IdcColumnsService {
  private readonly RESOURCE_URL = '/idc_reporting_columns';
  private _idcColumns: IdcColumn[];
  private _idcColumnsObject: IdcColumnsObject;

  constructor(private wsp: WebServiceProvider) {}

  getIdcColumns(): Promise<IdcColumn[]> {
    if (this._idcColumns) {
      return Promise.resolve(this._idcColumns);
    }
    const fields = ['id', 'idcColumnName', 'pnklColumnName', 'Type'],
      getWebRequest: GetWebRequest = {
        endPoint: this.RESOURCE_URL,
        options: { fields }
      };
    return this.wsp
      .get(getWebRequest)
      .then((idcColumnsFromApi: IdcColumnFromApi[]) => {
        return idcColumnsFromApi.map(idcColumn =>
          this.formatIdcColumn(idcColumn)
        );
      });
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

  private formatIdcColumn(column: IdcColumnFromApi): IdcColumn {
    let id = parseInt(column.id);
    return new IdcColumn(
      !isNaN(id) ? id : null,
      column.idccolumnname,
      column.pnklcolumnname
    );
  }
}
