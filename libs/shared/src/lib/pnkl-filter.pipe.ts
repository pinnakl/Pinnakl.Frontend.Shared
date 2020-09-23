import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'pnklFilter' })
export class PnklFilterPipe implements PipeTransform {
  transform(items: Array<any>, filter: any): Array<any> {
    if (!items || !filter) {
      return items;
    }
    let filterKey: any = Object.keys(filter);
    let filterValue = filter[filterKey[0]];
    return items.filter(item => item[filterKey] === filterValue);
  }
}
