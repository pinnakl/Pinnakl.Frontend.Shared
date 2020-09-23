import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cropText'
})
export class CropTextPipe implements PipeTransform {
  transform(value: string, length: number): string {
    return !length || typeof length !== 'number'
      ? value
      : value.length > length
        ? `${value.substr(0, length)}...`
        : value;
  }
}
