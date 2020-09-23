import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { AuditLogFromApi } from '../models/audit-log-from-api.model';
import { AuditLog } from '../models/audit-log.model';

@Injectable()
export class AuditLogService {
  private readonly RESOURCE_URL = 'audit';
  actionStrings = { i: 'Insert', u: 'Update', d: 'Delete' };

  constructor(private wsp: WebServiceProvider) {}

  getAuditLogsForTable(tableName: string, id: number): Promise<AuditLog[]> {
    let fields = [
      'action',
      'fieldname',
      'id',
      'logTime',
      'newValue',
      'oldValue',
      'pk',
      'tableName',
      'username'
    ];
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields: fields,
        filters: [
          {
            key: 'tableName',
            type: 'EQ',
            value: [tableName]
          },
          {
            key: 'pk',
            type: 'EQ',
            value: [id.toString()]
          }
        ]
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then((entities: AuditLogFromApi[]) =>
        entities.map(column => this.formatAuditLog(column))
      );
  }

  getAuditLogsForTableAndIds(
    tableName: string,
    ids: number[]
  ): Promise<AuditLog[]> {
    let fields = [
      'action',
      'fieldname',
      'id',
      'logTime',
      'newValue',
      'oldValue',
      'pk',
      'tableName',
      'username'
    ];
    ids = ids.filter(id => id != null);
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields: fields,
        filters: [
          {
            key: 'tableName',
            type: 'EQ',
            value: [tableName]
          },
          {
            key: 'pk',
            type: 'IN',
            value: ids.length > 0 ? ids.map(id => id.toString()) : []
          }
        ]
      }
    };
    return this.wsp
      .get(getWebRequest)
      .then((entities: AuditLogFromApi[]) =>
        entities.map(column => this.formatAuditLog(column))
      );
  }

  getAuditLogsForTableFieldWithAction(
    action: string,
    fieldName: string[],
    tableName: string
  ): Promise<AuditLog[]> {
    let fields = [
      'action',
      'fieldname',
      'id',
      'logTime',
      'newValue',
      'oldValue',
      'pk',
      'tableName',
      'username'
    ];
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields: fields,
        filters: [
          {
            key: 'action',
            type: 'EQ',
            value: [action]
          },
          {
            key: 'tableName',
            type: 'EQ',
            value: [tableName]
          },
          {
            key: 'pk',
            type: 'IN',
            value: fieldName
          }
        ]
      }
    };
    return this.wsp
      .get(getWebRequest)
      .then((entities: AuditLogFromApi[]) =>
        entities.map(column => this.formatAuditLog(column))
      );
  }

  getDeletedAuditLogForSecurityId(
    fieldName: string,
    fieldValue: number,
    tableName: string
  ): Promise<AuditLog[]> {
    let fields = [
      'action',
      'fieldname',
      'id',
      'logTime',
      'newValue',
      'oldValue',
      'pk',
      'tableName',
      'username'
    ];
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields: fields,
        filters: [
          {
            key: 'action',
            type: 'EQ',
            value: ['d']
          },
          {
            key: 'fieldName',
            type: 'EQ',
            value: [fieldName]
          },
          {
            key: 'oldValue',
            type: 'EQ',
            value: [fieldValue.toString()]
          },
          {
            key: 'tableName',
            type: 'EQ',
            value: [tableName]
          }
        ]
      }
    };
    return this.wsp
      .get(getWebRequest)
      .then((entities: AuditLogFromApi[]) =>
        entities.map(column => this.formatAuditLog(column))
      );
  }

  private formatAuditLog(entity: AuditLogFromApi): AuditLog {
    let action = this.actionStrings[entity.action.toLowerCase()],
      id = parseInt(entity.id),
      pk = parseInt(entity.pk),
      logTime = moment(entity.logtime, 'MM/DD/YYYY HH:mm:ss');
    return new AuditLog(
      action,
      entity.fieldname,
      !isNaN(id) ? id : null,
      logTime.isValid() ? logTime.toDate() : null,
      entity.newvalue,
      entity.oldvalue,
      !isNaN(pk) ? pk : null,
      entity.tablename,
      entity.username
    );
  }
}
