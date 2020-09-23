import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'limitDecimal' })
export class LimitDecimalPipe implements PipeTransform {
  transform(item: string): string | number {
    return (item && parseFloat(item).toFixed(2)) || item;
  }
}
