import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Align {
  [key: string]: string[] | number | {};
}

@Component({
  selector: 'confirm-action',
  templateUrl: './confirm-action.component.html'
})
// tslint:disable-next-line:component-class-suffix
export class ConfirmAction {
  @Input() containerClass = 'confirm-delete';
  @Input() messageClass: string;
  @Input() confirmationMessage: string;
  @Input() showConfirmation;
  @Input() anchor: any;
  @Output() onCancelled: EventEmitter<void> = new EventEmitter<void>();
  @Output() onConfirmed: EventEmitter<void> = new EventEmitter<void>();

  private anchorAlign: Align;
  private popupAlign: Align;

  constructor() {
    this.anchorAlign = { horizontal: 'right', vertical: 'bottom' };
    this.popupAlign = { horizontal: 'right', vertical: 'top' };
  }
  cancelAction(): void {
    this.onCancelled.emit();
  }
  actionConfirmed(): void {
    this.onConfirmed.emit();
  }
}
