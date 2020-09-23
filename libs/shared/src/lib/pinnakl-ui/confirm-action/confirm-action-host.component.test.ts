import { Component } from '@angular/core';

@Component({
  template: `
    <confirm-action
      [anchor]="anchor"
      [messageClass]="messageClass"
      [containerClass]="containerClass"
      [confirmationMessage]="confirmationMessage"
      [showConfirmation]="showConfirmAction"
      (onCancelled)="onCancel()"
      (onConfirmed)="onConfirm()"
    ></confirm-action>
  `
})
export class ConfirmActionHostComponent {
  containerClass;
  anchor;
  messageClass;
  confirmationMessage = 'Are you sure you want to do this?';
  showConfirmAction = true;

  onCancel(): void {
    this.showConfirmAction = false;
  }

  onConfirm(): void {
    this.showConfirmAction = false;
  }
}
