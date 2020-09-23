import { Pipe, PipeTransform } from '@angular/core';

import { sortBy } from 'lodash';

import { ValueHistoryItem } from './value-history-item.model';

@Pipe({
  name: 'sortValueHistoryItems'
})
export class SortValueHistoryItemsPipe implements PipeTransform {
  transform(valueHistoryItems: ValueHistoryItem[]): ValueHistoryItem[] {
    return sortBy(valueHistoryItems, ['endDate']);
  }
}
