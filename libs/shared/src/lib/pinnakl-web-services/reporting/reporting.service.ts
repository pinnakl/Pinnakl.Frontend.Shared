import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import * as moment from 'moment';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { FileService } from '../../pinnakl-web-services/file.service';
import { Utility } from '../../services/utility.service';
import { OmsAndPositionsColumnFromApi } from '../../models/reporting/oms-positions-column-from-api.model';
import { ReportOptions } from '../../models/reporting/report-options.model';
import { ReportParameterFromApi } from '../../models/reporting/report-parameter-from-api.model';
import { ReportParameter } from '../../models/reporting/report-parameter.model';
import { ReportingColumn } from '../../models/reporting/reporting-column.model';

@Injectable()
export class ReportingService {
  private readonly REPORT_PARAMETERS_RESOURCE_URL = 'report_parameters';

  constructor(
    private fileService: FileService,
    private utility: Utility,
    private wsp: WebServiceProvider
  ) {}

  formatReportParameter(
    reportParameter: ReportParameterFromApi
  ): ReportParameter {
    let type = reportParameter.type,
      formattedParameter = new ReportParameter(
        reportParameter.caption,
        reportParameter.defaultvalue,
        parseInt(reportParameter.id),
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

  getDropdownValues(
    id: number,
    params: ReportParameter[],
    reportingColumns: ReportingColumn[],
    typeName: string
  ): Promise<string[]> {
    let reportOptions = {} as ReportOptions;
    reportOptions.reportingColumns = reportingColumns;
    reportOptions.id = id;
    reportOptions.parameters = this.getParametersForReportOptions(params);
    const getWebRequest: GetWebRequest = {
      endPoint: typeName,
      options: {
        filters: [
          {
            key: 'reportOptions',
            type: 'EQ',
            value: [JSON.stringify(reportOptions)]
          }
        ]
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then((options: { [columnName: string]: string }[]) => {
        if (!options || options.length === 0) {
          return [];
        }
        let columnName = Object.keys(options[0])[0];
        return _(options)
          .uniqBy(columnName)
          .map(columnName)
          .sort()
          .value();
      });
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

  getReportId(reportName: string): Promise<any> {
    let fields = ['Id'];
    const getWebRequest: GetWebRequest = {
      endPoint: 'reports',
      options: {
        fields: fields,
        filters: [
          {
            key: 'ReportName',
            type: 'EQ',
            value: [reportName]
          }
        ]
      }
    };

    return this.wsp.get(getWebRequest).then(result => {
      if (result.length > 0) {
        return parseInt(result[0].id);
      } else {
        return null;
      }
    });
  }

  getReportData(
    id: number,
    params: ReportParameter[],
    reportingColumns: ReportingColumn[],
    endPoint: string = 'report'
  ): Promise<any[]> {
    let reportOptions = new ReportOptions();
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
        let rc = new ReportingColumn();
        rc.include = col.include;
        let filters = col.filters;
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

    const getWebRequest: GetWebRequest = {
      endPoint,
      options: {
        filters: [
          {
            key: 'reportOptions',
            type: 'EQ',
            value: [JSON.stringify(reportOptions)]
          }
        ]
      }
    };
    return this.wsp.get(getWebRequest, true).then(reportData => {
      let numericColumns = _.filter(
        reportingColumns,
        col => col.type === 'numeric' || col.type === 'currency'
      );
      for (let column of numericColumns) {
        for (let row of reportData) {
          let value = parseFloat(row[column.name]);
          row[column.name] = !isNaN(value) ? value : null;
        }
      }
      let dateColumns = _.filter(reportingColumns, { type: 'date' });
      for (let column of dateColumns) {
        for (let row of reportData) {
          let value = moment(row[column.name]);
          row[column.name] = value.isValid() ? value.toDate() : null;
        }
      }
      return reportData;
    });
  }

  getReportParameters(reportId: number): Promise<ReportParameter[]> {
    const fields = ['name', 'caption', 'type', 'defaultvalue', 'required'],
      getWebRequest: GetWebRequest = {
        endPoint: this.REPORT_PARAMETERS_RESOURCE_URL,
        options: {
          fields,
          filters: [
            { key: 'reportId', type: 'EQ', value: [reportId.toString()] }
          ]
        }
      };
    return this.wsp
      .get(getWebRequest)
      .then((parameters: ReportParameterFromApi[]) =>
        parameters
          .map(parameter => this.formatReportParameter(parameter))
          .filter(param => param.name !== 'clientid')
      );
  }

  prepAllColumns(
    allColumns: OmsAndPositionsColumnFromApi[]
  ): ReportingColumn[] {
    let so = 1,
      vo = 1;
    return allColumns.map(column => {
      let {
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
    let reportOptions = new ReportOptions();
    reportOptions.id = id;
    reportOptions.parameters = this.getParametersForReportOptions(params);

    reportingColumns = reportingColumns
      .filter(col => col.viewOrder !== -1 || col.filters)
      .map(col => {
        let rc = new ReportingColumn();
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

    reportOptions.clientReportId = clientReportId;
    reportOptions.exportedFileName = exportedFileName;
    reportOptions.exportToExcel = exportToExcel;
    reportOptions.exportToPdf = !exportToExcel;
    reportOptions.reportingColumns = reportingColumns;
    const getWebRequest: GetWebRequest = {
      endPoint: 'report',
      options: {
        filters: [
          {
            key: 'reportOptions',
            type: 'EQ',
            value: [JSON.stringify(reportOptions)]
          }
        ]
      }
    };
    return this.wsp
      .get(getWebRequest, true)
      .then((result: { fileid: string }[]) => parseInt(result[0].fileid));
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
