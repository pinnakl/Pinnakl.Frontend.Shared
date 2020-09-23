import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import * as moment from 'moment';

import {
  FrontendErrorService,
  PinnaklSpinner,
  Toastr
} from '@pnkl-frontend/core';
import { Holiday } from '../models/oms/holiday.model';

@Injectable()
export class Utility {
  errorHandler = function (error: object): void {
    this.utility.showError(error);
  };

  constructor(
    private frontendErrorService: FrontendErrorService,
    private pinnaklSpinner: PinnaklSpinner,
    private toastr: Toastr
  ) {}

  addWeekdays(date: Date, days: number): Date {
    let dateMoment = moment(date);
    while (days !== 0) {
      dateMoment =
        days > 0 ? dateMoment.add(1, 'days') : dateMoment.subtract(1, 'days');
      if (dateMoment.isoWeekday() !== 6 && dateMoment.isoWeekday() !== 7) {
        let increment = days > 0 ? -1 : 1;
        days += increment;
      }
    }
    return dateMoment.toDate();
  }

  addBusinessDays(date: Date, days: number, holidays: Holiday[]): Date {
    let dateMoment = moment(date); // use a clone

    let momentHolidaysArray = _.map(holidays, 'holidayDate').map(o =>
      moment(o).format('MM/DD/YYYY')
    );

    while (days !== 0) {
      dateMoment =
        days > 0 ? dateMoment.add(1, 'days') : dateMoment.subtract(1, 'days');
      if (
        dateMoment.isoWeekday() !== 6 &&
        dateMoment.isoWeekday() !== 7 &&
        momentHolidaysArray.indexOf(dateMoment.format('MM/DD/YYYY')) === -1
      ) {
        let increment = days > 0 ? -1 : 1;
        days += increment;
      }
    }
    return dateMoment.toDate();
  }

  compareDates(date1: Date, date2: Date): boolean {
    if (date1) {
      if (date2) {
        return this.compareDatesWithoutTime(date1, date2) === 0;
      } else {
        return false;
      }
    } else {
      if (date2) {
        return false;
      } else {
        return true;
      }
    }
  }

  compareDatesWithoutTime(date1: Date, date2: Date): number {
    if (!date1 || !date2) {
      return null;
    }
    let dateA = new Date(date1.getTime());
    dateA.setHours(0, 0, 0, 0);
    let dateB = new Date(date2.getTime());
    dateB.setHours(0, 0, 0, 0);
    return dateA.getTime() - dateB.getTime();
  }

  compareNumeric(num1: number, num2: number): boolean {
    if (isNaN(num1)) {
      num1 = null;
    }
    if (isNaN(num2)) {
      num2 = null;
    }
    return num1 === num2;
  }

  compareStrings(string1: string, string2: string): boolean {
    if (!string1 && !string2) {
      return true;
    }
    return string1 === string2;
  }

  getUpdatedEntities<T extends { id: number }>(
    existingEntities: Partial<T>[],
    newEntities: Partial<T>[],
    keysToExclude: (keyof T)[] = []
  ): (Partial<T> & { apiAction: string })[] {
    const toPost = newEntities
      .filter(e => !e.id)
      .map(e => ({ ...(<any>e), apiAction: 'post' }));
    const toPut = newEntities.reduce((accumulated, e) => {
      if (!e.id) {
        return accumulated;
      }
      const existingEntity = existingEntities.find(({ id }) => id === e.id);
      const updatedEntity = this.getUpdatedEntity(
        existingEntity,
        e,
        keysToExclude
      );
      return !updatedEntity
        ? accumulated
        : [...accumulated, { ...(<any>updatedEntity), apiAction: 'put' }];
    }, []);
    const toDelete = _.differenceBy(
      existingEntities,
      newEntities,
      e => e.id
    ).map(({ id }) => ({ id, apiAction: 'delete' }));
    const entities = [...toPost, ...toPut, ...toDelete];
    return entities.length ? entities : null;
  }

  getUpdatedEntity<T extends { id: number }>(
    existingEntity: Partial<T>,
    newEntity: Partial<T>,
    keysToExclude: (keyof T)[] = []
  ): Partial<T> {
    const changes = Object.keys(newEntity)
      .filter(key => ![...keysToExclude, 'id'].includes(key))
      .reduce((accumulated, key) => {
        return newEntity[key] === existingEntity[key]
          ? accumulated
          : { ...accumulated, [key]: newEntity[key] };
      }, {});
    if (!Object.keys(changes).length) {
      return null;
    }
    return { ...changes, id: existingEntity.id } as Partial<T>;
  }

  isDateInBetween(currentDate: Date, startDate: Date, endDate: Date): boolean {
    if (
      (!startDate ||
        this.compareDatesWithoutTime(currentDate, startDate) >= 0) &&
      (!endDate || this.compareDatesWithoutTime(endDate, currentDate) >= 0)
    ) {
      return true;
    }
    return false;
  }

  isUndefinedOrNull(value: any): boolean {
    return value === undefined || value === null;
  }

  async performAsyncOperation(
    operation: () => Promise<void>,
    successMessage: string = ''
  ): Promise<void> {
    try {
      this.pinnaklSpinner.spin();
      await operation();
      this.toastr.success(successMessage || 'Success!');
      this.pinnaklSpinner.stop();
    } catch (e) {
      this.showError(e);
    }
  }

  showError(error: { clientMessage: string }): void {
    this.pinnaklSpinner.stop();
    const defaultErrorMessage = 'An unexpected error occurred';
    if (!error) {
      this.toastr.error(defaultErrorMessage);
      return;
    }
    let { clientMessage } = error,
      errorMessage = clientMessage ? clientMessage : defaultErrorMessage;
    this.toastr.error(errorMessage);
    this.frontendErrorService.handleError(error);
  }

  getPreviousBusinessDay(initialDate?: Date): Date {
    const dayInMs = 24 * 60 * 60 * 1000;
    let lastWorkDay = new Date(
      (initialDate ? initialDate.getTime() : Date.now()) - dayInMs
    );
    while ([0, 6].includes(lastWorkDay.getDay())) {
      lastWorkDay = new Date(lastWorkDay as any - dayInMs);
    }
    return lastWorkDay;
  }
}
