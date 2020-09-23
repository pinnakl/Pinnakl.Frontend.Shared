import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'numberWithCommas' })
export class NumberWithCommasPipe implements PipeTransform {
  transform(item: string | number): string | number {
    // if (item) {
    //     return item.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // } else {
    //     return item;
    // }
    return (
      (item && item.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')) || item
    );
  }
}
