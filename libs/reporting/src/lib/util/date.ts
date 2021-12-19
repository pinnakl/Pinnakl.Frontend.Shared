import * as moment from "moment";

const DATE_TYPE = 'date';
const DATE_TYPE_FORMAT = 'MM/DD/YYYY';
const DATE_TIME_TYPE = 'datetime';
const DATE_TIME_FORMAT = 'MM/DD/YYYY hh:mm:ss A';
const DATE_TIME_IN_UTC_TYPE = 'datetimeutc';
const DATE_TIME_IN_UTC_FORMAT = 'MM/DD/YYYY hh:mm:ss A';

/**
 * @example date -> 08/18/2021; dateandtime -> 08/18/2021 11:32;
 * @param date date to being transformed.
 * @param locale localization value.
 * @param columnType ag-Grid column type. Possible types are : 'date', 'datetime', 'datetimeutc'.
 * @param config format types for dates.
 * @returns a formatted date depends on column type.
 */
export function reportColumnDateTypeFormat(
  date: string | Date | moment.Moment,
  columnType: string,
  config?: {
    dateFormat?: string;
    dateTimeFormat?: string;
    dateTimeInUtcFormat?: string;
  }): string | Date | moment.Moment {
    // if there are not date to transform - return empty string.
    if (!date) {
      return "";
    }

  const dateFormatType = new Map<string, string>();
  dateFormatType
    .set(DATE_TYPE, config?.dateFormat ?? DATE_TYPE_FORMAT)
    .set(DATE_TIME_TYPE, config?.dateTimeFormat ?? DATE_TIME_FORMAT)
    .set(DATE_TIME_IN_UTC_TYPE, config?.dateTimeInUtcFormat ?? DATE_TIME_IN_UTC_FORMAT);

  const withoutLocaleRule = (): boolean => {
    return columnType === DATE_TYPE || columnType === DATE_TIME_TYPE;
  };

  return withoutLocaleRule()
    ? moment(date).format(dateFormatType.get(columnType))
    : moment(moment.utc(date).toDate()).format(dateFormatType.get(columnType) || DATE_TYPE_FORMAT);
}
