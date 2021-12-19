import * as moment from 'moment';
import { PinnaklDateType } from '../input-options.model';

export class PinnaklDateInputHelper {

  /**
   * @param v value comes from input control in Date format
   * @param {PinnaklDateType} type input type
   * @returns a formatted value depending on input date type
   * @example date - without any changes
   * @example month-picker - the last day from the selected month
   */
  inputTypePreformation(v: string | Date, type: PinnaklDateType): string | Date {
    if (type === PinnaklDateType.MonthPicker) {
      return new Date(moment(v).endOf('month').format('l'));
    }
    return v;
  }
}
