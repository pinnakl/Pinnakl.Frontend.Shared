import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'pinnakl-modal',
  templateUrl: './pinnakl-modal.component.html',
  styleUrls: ['./pinnakl-modal.component.scss']
})
export class PinnaklModalComponent {
  @Input() height: number;
  @Input() hideDialog = true;
  @Input() minWidth: number;
  @Input() showCloseButton = true;
  @Input() title;
  @Output() closeModal = new EventEmitter();
  @Input() width;
  @Input() className;
  constructor() {}

  closeModalEmit(): void {
    this.closeModal.emit();
  }
}
