import { ReportColumn, ReportingColumn } from '../../models/reporting';
import { CustomAttribute } from '../../models/security';

export function getReportingColumnsFromCustomAttributes(
  customAttributes: CustomAttribute[]
): ReportingColumn[] {
  return customAttributes.map(customAttribute =>
    _getReportingColumnFromSecurityCustomAttribute(customAttribute)
  );
}

export function getReportingColumnsFromReportColumn(
  reportColumns: ReportColumn[]
): ReportingColumn[] {
  return reportColumns.map(reportColumn =>
    _getReportingColumnFromReportColumn(reportColumn)
  );
}

function _getReportingColumnFromReportColumn({
  filterValues: filters,
  id: dbId,
  reportId,
  ...rc
}: ReportColumn): ReportingColumn {
  return {
    ...rc,
    dbId,
    filters,
    include: rc.viewOrder !== -1,
    reportingColumnType: 'report'
  };
}

function _getReportingColumnFromSecurityCustomAttribute({
  id: dbId,
  listOptions,
  ...ca
}: CustomAttribute): ReportingColumn {
  return {
    ...ca,
    caption: ca.name,
    convertToBaseCurrency: false,
    dbId,
    decimalPlaces: null,
    filters: null,
    groupOrder: null,
    include: true,
    isAggregating: false,
    renderingFunction: null,
    reportingColumnType: 'ca',
    sortAscending: null,
    sortOrder: null,
    viewOrder: null,
    formula: null,
  };
}
