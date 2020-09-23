import { Injectable } from '@angular/core';

import { sortBy } from 'lodash';
import * as moment from 'moment';

interface Entity {
  endDate: Date;
  startDate: Date;
}

@Injectable()
export class EntityDurationValidationService {
  someDurationMissing(entities: Entity[]): boolean {
    const startDateNullForSome = entities.some(({ startDate }) => !startDate);
    const endDateNullForSome = entities.some(({ endDate }) => !endDate);
    if (!(startDateNullForSome && endDateNullForSome)) {
      return true;
    }
    const entitiesSortedByEndDate = sortBy(entities, ['endDate']);
    const someDurationMissing = entitiesSortedByEndDate.some((item, i) => {
      if (!item.endDate) {
        return false;
      }
      const next = entitiesSortedByEndDate[i + 1];
      if (!next) {
        return false;
      }
      const nextDayOfCurrent = moment(item.endDate).add(1, 'days');
      if (nextDayOfCurrent.isSame(moment(next.startDate))) {
        return false;
      }
      return true;
    });
    return someDurationMissing;
  }
  validate(existingEntity: Entity, newEntity: Entity): boolean {
    if (!existingEntity.startDate && !existingEntity.endDate) {
      return false;
    } else if (!existingEntity.startDate && existingEntity.endDate) {
      return (
        !!newEntity.startDate && newEntity.startDate > existingEntity.endDate
      );
    } else if (existingEntity.startDate && !existingEntity.endDate) {
      return (
        !!newEntity.endDate && newEntity.endDate < existingEntity.startDate
      );
    } else {
      if (!newEntity.startDate && !newEntity.endDate) {
        return false;
      } else if (!newEntity.startDate && newEntity.endDate) {
        return newEntity.endDate < existingEntity.startDate;
      } else if (newEntity.startDate && !newEntity.endDate) {
        return newEntity.startDate > existingEntity.endDate;
      } else {
        return (
          newEntity.endDate < existingEntity.startDate ||
          newEntity.startDate > existingEntity.endDate
        );
      }
    }
  }
  validateAgainstExistingEntities(
    newEntity: Entity,
    existingEntities: Entity[]
  ): {} {
    const { endDate, startDate } = newEntity;
    if (!startDate || !endDate || startDate < endDate) {
      if (existingEntities.some(item => !this.validate(item, newEntity))) {
        return {
          validateEndDate: {
            valid: false,
            errorMessage:
              'Multiple entities will become active within the same period'
          }
        };
      }
      return null;
    }
    return {
      validateEndDate: {
        valid: false,
        errorMessage: 'Invalid End Date'
      }
    };
  }
}
