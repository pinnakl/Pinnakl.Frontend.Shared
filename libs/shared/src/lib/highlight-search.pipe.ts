import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight'
})

export class HighlightSearchPipe implements PipeTransform {

  transform(value: string, args: any): string {
    if (!args) { return value; }
    let re = new RegExp(args, 'gi');
    return value.replace(re, "<mark>$&</mark>");
  }
}
