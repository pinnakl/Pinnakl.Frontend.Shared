import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'keys' })
export class KeysPipe implements PipeTransform {
  transform(object, args): any {
    let keys = [];
    for (let key in object) {
      if (object.hasOwnProperty(key)) {
        keys.push({ key: key, value: object[key] });
      }
    }
    return keys;
  }
}
