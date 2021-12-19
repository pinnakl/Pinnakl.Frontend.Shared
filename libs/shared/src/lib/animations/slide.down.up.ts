import { animate, style, transition, trigger } from '@angular/animations';

/**
 * @example <ul@slideDownUp)><li>{{ VARIABLE }}</li></ul>
 * @param animateDuration time for element expand/collapse
 * @returns an Angular trigger function.
 */
export function slideDownUp(animateDuration = 250) {
  return trigger('slideDownUp', [
    transition(':enter', [style({ height: 0 }), animate(animateDuration)]),
    transition(':leave', [animate(animateDuration, style({ height: 0 }))])
  ]);
}
