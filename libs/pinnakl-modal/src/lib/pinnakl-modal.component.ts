import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'pinnakl-modal',
  templateUrl: './pinnakl-modal.component.html',
  styleUrls: ['./pinnakl-modal.component.scss']
})
export class PinnaklModalComponent {
  @Input() height: number | string;
  @Input() width: number | string;
  @Input() minWidth: number | string;
  @Input() maxHeight: number | string;
  @Input() hideDialog = true;
  @Input() showCloseButton = true;
  @Input() title: string;
  @Input() className: string;
  @Input() draggable = false;
  @Output() closeModal = new EventEmitter();

  closeModalEmit(): void {
    this.closeModal.emit();
  }
}
