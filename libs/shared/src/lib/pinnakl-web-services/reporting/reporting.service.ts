import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import * as moment from 'moment';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { ReportingColumn, ReportOptions, ReportParameter } from '../../models';
import { OmsAndPositionsColumnFromApi } from '../../models/reporting/oms-positions-column-from-api.model';
import { ReportParameterFromApi } from '../../models/reporting/report-parameter-from-api.model';

import { Utility } from '../../services';
import { FileService } from '../file.service';

@Injectable()
export class ReportingService {
  private readonly _reportEndpoint = 'entities/report';
  private readonly _reportsEndpoint = 'entities/reports';
  private readonly _reportParametersEndpoint = 'entities/report_parameters';

  constructor(
    private readonly fileService: FileService,
    private readonly utility: Utility,
    private readonly wsp: WebServiceProvider
  ) { }

  formatReportParameter(
    reportParameter: ReportParameterFromApi
  ): ReportParameter {
    const type = reportParameter.type,
      formattedParameter = new ReportParameter(
        reportParameter.caption,
        reportParameter.defaultvalue,
        parseInt(reportParameter.id, 10),
        reportParameter.name.toLowerCase(),
        reportParameter.required === 'True',
        type,
        null
      );
    if (type === 'date') {
      if (reportParameter.defaultvalue.toLowerCase() === 'yearstart') {
        formattedParameter.value = new Date(new Date().getFullYear(), 0, 1);
      } else if (reportParameter.defaultvalue.toLowerCase() === 'yesterday') {
        formattedParameter.value = this.utility.addBusinessDays(
          moment().toDate(),
          -1,
          []
        );
      } else {
        formattedParameter.value = new Date();
      }
    } else if (type === 'numeric') {
      formattedParameter.value = 0;
    }
    return formattedParameter;
  }

  async getDropdownValues(
    id: number,
    params: ReportParameter[],
    reportingColumns: ReportingColumn[],
    typeName: string
  ): Promise<string[]> {
    const reportOptions = {} as ReportOptions;
    reportOptions.reportingColumns = reportingColumns;
    reportOptions.id = id;
    reportOptions.parameters = this.getParametersForReportOptions(params);

    const options = await this.wsp.getHttp<{ [columnName: string]: string }[]>({
      endpoint: typeName,
      params: {
        filters: [
          {
            key: 'reportOptions',
            type: 'EQ',
            value: [JSON.stringify(reportOptions)]
          }
        ]
      }
    });

    if (!options || options.length === 0) {
      return [];
    }
    const columnName = Object.keys(options[0])[0];
    return _(options)
      .uniqBy(columnName)
      .map(columnName)
      .sort()
      .value();
  }

  exportAndDownloadReport(
    clientReportId: number,
    exportedFileName: string,
    exportToExcel: boolean,
    id: number,
    params: ReportParameter[],
    reportingColumns: ReportingColumn[]
  ): Promise<void> {
    return this.exportReport(
      clientReportId,
      exportedFileName,
      exportToExcel,
      id,
      params,
      reportingColumns
    ).then(fileId => {
      this.fileService.download(fileId);
    });
  }

  async getReportId(reportName: string): Promise<any> {
    const result = await this.wsp.getHttp<any[]>({
      endpoint: this._reportsEndpoint,
      params: {
        fields: ['Id'],
        filters: [
          {
            key: 'ReportName',
            type: 'EQ',
            value: [reportName]
          }
        ]
      }
    });

    return result.length > 0 ? parseInt(result[0].id, 10) : null;
  }

  getReportData(
    id: number,
    params: ReportParameter[],
    reportingColumns: ReportingColumn[],
    endpoint: string = 'entities/report'
  ): Promise<any[]> {
    const reportOptions = new ReportOptions();
    reportOptions.id = id;
    reportOptions.parameters = this.getParametersForReportOptions(params);

    reportingColumns = reportingColumns
      .filter(
        col =>
          col.include ||
          (col.filters instanceof Array
            ? col.filters.length > 0
            : !(col.filters === undefined || col.filters === null))
      )
      .map(col => {
        const rc = new ReportingColumn();
        rc.include = col.include;
        const filters = col.filters;
        if (!(filters === undefined || filters === null)) {
          if (filters instanceof Array) {
            if (filters.length > 0) {
              rc.filters = filters;
            }
          } else {
            rc.filters = <any>[filters];
          }
        }
        rc.name = col.name;
        rc.reportingColumnType = col.reportingColumnType;
        rc.type = col.type;
        return rc;
      });

    reportOptions.reportingColumns = reportingColumns;

    return this.wsp.getHttp<any[]>({
      endpoint,
      params: {
        filters: [
          {
            key: 'reportOptions',
            type: 'EQ',
            value: [JSON.stringify(reportOptions)]
          }
        ]
      }
    }).then(reportData => {
      const numericColumns = _.filter(
        reportingColumns,
        col => col.type === 'numeric' || col.type === 'currency'
      );
      for (const column of numericColumns) {
        for (const row of reportData) {
          const value = parseFloat(row[column.name]);
          row[column.name] = !isNaN(value) ? value : null;
        }
      }
      const dateColumns = _.filter(reportingColumns, { type: 'date' });
      for (const column of dateColumns) {
        for (const row of reportData) {
          const value = moment(row[column.name]);
          row[column.name] = value.isValid() ? value.toDate() : null;
        }
      }
      return reportData;
    });
  }

  getReportParameters(reportId: number): Promise<ReportParameter[]> {
    return this.wsp
      .getHttp<ReportParameterFromApi[]>({
        endpoint: this._reportParametersEndpoint,
        params: {
          fields: ['name', 'caption', 'type', 'defaultvalue', 'required'],
          filters: [
            { key: 'reportId', type: 'EQ', value: [reportId.toString()] }
          ]
        }
      })
      .then(parameters => parameters
          .map<ReportParameter>(this.formatReportParameter.bind(this))
          .filter(param => param.name !== 'clientid')
      );
  }

  prepAllColumns(
    allColumns: OmsAndPositionsColumnFromApi[]
  ): ReportingColumn[] {
    let so = 1,
      vo = 1;
    return allColumns.map(column => {
      const {
          datatype,
          isaggregating,
          isascendingbydefault,
          isvisiblebydefault,
          name
        } = column,
        col = new ReportingColumn();
      col.caption = name;
      col.include = isvisiblebydefault === 'True';
      col.isAggregating = isaggregating === 'True';
      col.name = name;
      col.reportingColumnType = 'report';
      if (isascendingbydefault) {
        col.sortOrder = so++;
        col.sortAscending = isascendingbydefault === 'True';
      }
      col.type = datatype === 'string' ? 'text' : datatype;
      col.viewOrder = vo++;
      return col;
    });
  }

  private exportReport(
    clientReportId: number,
    exportedFileName: string,
    exportToExcel: boolean,
    id: number,
    params: ReportParameter[],
    reportingColumns: ReportingColumn[]
  ): Promise<number> {
    const reportOptions = new ReportOptions();
    reportOptions.id = <any>id.toString();
    reportOptions.parameters = this.getParametersForReportOptions(params);

    reportingColumns = reportingColumns
      .filter(col => col.viewOrder !== -1 || col.filters)
      .map(col => {
        const rc = new ReportingColumn();
        if (col.filters) {
          rc.filters = col.filters;
        }
        if (col.groupOrder !== undefined && col.groupOrder !== null) {
          rc.groupOrder = col.groupOrder;
        }
        rc.include = col.viewOrder !== -1;
        rc.name = col.name;
        rc.reportingColumnType = col.reportingColumnType;
        if (col.sortOrder !== undefined && col.sortOrder !== null) {
          rc.sortAscending = col.sortAscending;
          rc.sortOrder = col.sortOrder;
        }
        return rc;
      });

    reportOptions.clientReportId = <any>clientReportId.toString();
    reportOptions.exportedFileName = exportedFileName;
    reportOptions.exportToExcel = exportToExcel;
    reportOptions.exportToPdf = !exportToExcel;
    reportOptions.reportingColumns = reportingColumns;

    return this.wsp
      .getHttp<{ fileid: string }[]>({
        endpoint: this._reportEndpoint,
        params: {
          filters: [
            {
              key: 'reportOptions',
              type: 'EQ',
              value: [JSON.stringify(reportOptions)]
            }
          ]
        }
      })
      .then(result => +result[0].fileid);
  }

  private formatParameterValue(param: ReportParameter, dateFormat: string): Date {
    let value = param.value;
    if (param.type.toLowerCase() === 'date') {
      value = moment(value).format(dateFormat);
    }
    return <Date>value;
  }

  getParametersForReportOptions(params: ReportParameter[], dateFormat: string = 'YYYYMMDD'): {} {
    return params.reduce((paramsObject, param) => {
      paramsObject[param.name] = this.formatParameterValue(param, dateFormat);
      return paramsObject;
    }, {});
  }
}
