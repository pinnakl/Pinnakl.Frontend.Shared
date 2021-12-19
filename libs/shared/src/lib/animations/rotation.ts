import { animate, state, style, transition, trigger } from '@angular/animations';

export enum RotateAnimationStateStatus {
  Default = 'default',
  Rotated = 'rotated'
}

/**
 * @example <button [@rotatedState]="state" (click)="func()"></button>
 * @param angular on which angular element should be rotated
 * @param speed how fast in ms should action happen
 */
export function rotatedState(angular = 180, speed = 400) {
  return trigger('rotatedState', [
    state(RotateAnimationStateStatus.Default, style({ transform: 'rotate(0)' })),
    state(RotateAnimationStateStatus.Rotated, style({ transform: `rotate(-${angular}deg)` })),
    transition(
      `${RotateAnimationStateStatus.Rotated} => ${RotateAnimationStateStatus.Default}`,
      animate(`${speed}ms ease-out`)
    ),
    transition(
      `${RotateAnimationStateStatus.Default} => ${RotateAnimationStateStatus.Rotated}`,
      animate(`${speed}ms ease-in`)
    )
  ]);
}
