import { Injectable } from '@angular/core';

import * as moment from 'moment';

@Injectable()
export class WebServiceUtility {
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

  compareEntities<T>(
    entity: T,
    existingEntity: T,
    fields: {
      apiName: string;
      name: string;
      type: string;
      isNullable: boolean;
    }[]
  ): T {
    let updatedEntity = {} as T;
    for (let field of fields) {
      if (field.type === 'string') {
        if (
          !this.compareStrings(entity[field.name], existingEntity[field.name])
        ) {
          updatedEntity[field.name] = entity[field.name]
            ? entity[field.name]
            : null;
        }
      } else if (field.type === 'number') {
        if (
          !this.compareNumeric(entity[field.name], existingEntity[field.name])
        ) {
          updatedEntity[field.name] =
            entity[field.name] === undefined ? null : entity[field.name];
        }
      } else if (field.type === 'boolean') {
        if (!(!!entity[field.name] === !!existingEntity[field.name])) {
          updatedEntity[field.name] = entity[field.name];
        }
      } else if (field.type === 'Date') {
        if (
          !this.compareDates(entity[field.name], existingEntity[field.name])
        ) {
          updatedEntity[field.name] =
            entity[field.name] === undefined ? null : entity[field.name];
        }
      }
    }
    /*if (isEqual(updatedEntity, {})) {
      return null;
    }*/
    return updatedEntity;
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

  formatEntity<TFromApi, T>(
    entityFromApi: TFromApi,
    fields: {
      apiName: string;
      name: string;
      type: string;
      isNullable: boolean;
    }[]
  ): T {
    const entity = {} as T;
    for (let field of fields) {
      if (field.type === 'string') {
        entity[field.name] = entityFromApi[field.apiName];
      } else if (field.type === 'number') {
        let fieldItem = parseFloat(entityFromApi[field.apiName]);
        entity[field.name] = !isNaN(fieldItem) ? fieldItem : null;
      } else if (field.type === 'boolean') {
        let fieldItem = entityFromApi[field.apiName];
        entity[field.name] = fieldItem === 'True';
      } else if (field.type === 'Date') {
        let fieldItem = moment(
          entityFromApi[field.apiName],
          'MM/DD/YYYY hh:mm:ss a'
        );
        entity[field.name] = fieldItem.isValid() ? fieldItem.toDate() : null;
      }
    }
    return entity;
  }

  getEntityForServiceRequest<TFromApi, T>(
    entity: Partial<T>,
    fields: {
      apiName: string;
      name: string;
      type: string;
      isNullable: boolean;
    }[]
  ): Partial<TFromApi> {
    let entityForApi: Partial<TFromApi> = {};
    for (let field of fields) {
      if (entity[field.name] !== undefined) {
        if (field.type === 'string') {
          if (field.isNullable) {
            entityForApi[field.apiName] =
              entity[field.name] === null ? 'null' : entity[field.name];
          } else {
            entityForApi[field.apiName] = entity[field.name];
          }
        } else if (field.type === 'number') {
          if (field.isNullable) {
            entityForApi[field.apiName] =
              entity[field.name] === null
                ? 'null'
                : entity[field.name].toString();
          } else {
            entityForApi[field.apiName] = entity[field.name].toString();
          }
        } else if (field.type === 'boolean') {
          if (field.isNullable) {
            entityForApi[field.apiName] =
              entity[field.name] === null
                ? 'null'
                : entity[field.name]
                ? '1'
                : '0';
          } else {
            entityForApi[field.apiName] = entity[field.name] ? '1' : '0';
          }
        } else if (field.type.toLowerCase().includes('date')) {
          if (field.isNullable) {
            entityForApi[field.apiName] =
              entity[field.name] === null
                ? 'null'
                : moment(entity[field.name]).format('MM/DD/YYYY hh:mm:ss a');
          } else {
            entityForApi[field.apiName] = moment(entity[field.name]).format(
              'MM/DD/YYYY hh:mm:ss a'
            );
          }
        }
      }
    }
    return entityForApi;
  }
}
