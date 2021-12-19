import { Pipe, PipeTransform } from '@angular/core';
import { PublicIdentifier } from '@pnkl-frontend/shared';
import * as _ from 'lodash';

@Pipe({ name: 'sortPublicIdentifiers', pure: false })
export class SortPublicIdentifiers implements PipeTransform {
  transform(identifiers: PublicIdentifier[]): PublicIdentifier[] {
    return _.sortBy(identifiers, ['identifierType', 'endDate']);
  }
}
