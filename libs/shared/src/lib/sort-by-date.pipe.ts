import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortByDate'
})
export class SortByDatePipe implements PipeTransform {
  transform(value: any[], order: 'asc' | 'desc'): any {
    if (!value || !order) {
      return value;
    }
    return value.sort((a, b) => {
      return order === 'asc'
        ? a.date.getTime() - b.date.getTime()
        : a.date.getTime() + b.date.getTime();
    });
  }
}
