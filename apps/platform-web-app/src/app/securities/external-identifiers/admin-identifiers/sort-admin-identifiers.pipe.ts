import { Pipe, PipeTransform } from '@angular/core';
import { AdminIdentifier } from '@pnkl-frontend/shared';
import * as _ from 'lodash';

@Pipe({ name: 'sortAdminIdentifiers', pure: false })
export class SortAdminIdentifiers implements PipeTransform {
  transform(identifiers: AdminIdentifier[]): AdminIdentifier[] {
    return _.sortBy(identifiers, ['adminId', 'endDate']);
  }
}
