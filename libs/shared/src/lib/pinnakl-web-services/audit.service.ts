import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { AuditLog } from '../models';
import { AuditLogFromApi } from '../models/audit-log-from-api.model';

@Injectable()
export class AuditLogService {
  private readonly _auditEndpoint = 'entities/audit';
  actionStrings = { i: 'Insert', u: 'Update', d: 'Delete' };

  constructor(private readonly wsp: WebServiceProvider) {}

  async getAuditLogsForTable(
    tableName: string,
    id: number
  ): Promise<AuditLog[]> {
    const fields = [
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

    const auditLogs = await this.wsp.getHttp<AuditLogFromApi[]>({
      endpoint: this._auditEndpoint,
      params: {
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
    });

    return auditLogs.map(this.formatAuditLog);
  }

  async getAuditLogsForTableAndIds(
    tableName: string,
    ids: string[]
  ): Promise<AuditLog[]> {
    const fields = [
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

    const auditLogs = await this.wsp.getHttp<AuditLogFromApi[]>({
      endpoint: this._auditEndpoint,
      params: {
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
            value: ids
          }
        ]
      }
    });

    return auditLogs.map(this.formatAuditLog);
  }

  async getAuditLogsForTableFieldWithAction(
    action: string,
    fieldName: string[],
    tableName: string
  ): Promise<AuditLog[]> {
    const fields = [
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

    const auditLogs = await this.wsp.getHttp<AuditLogFromApi[]>({
      endpoint: this._auditEndpoint,
      params: {
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
    });

    return auditLogs.map(this.formatAuditLog);
  }

  async getDeletedAuditLogForSecurityId(
    fieldName: string,
    fieldValue: number,
    tableName: string
  ): Promise<AuditLog[]> {
    const fields = [
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

    const auditLogs = await this.wsp.getHttp<AuditLogFromApi[]>({
      endpoint: this._auditEndpoint,
      params: {
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
    });

    return auditLogs.map(this.formatAuditLog);
  }

  private formatAuditLog(entity: AuditLogFromApi): AuditLog {
    const action = this.actionStrings[entity.action.toLowerCase()],
      id = parseInt(entity.id, 10),
      pk = parseInt(entity.pk, 10),
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
