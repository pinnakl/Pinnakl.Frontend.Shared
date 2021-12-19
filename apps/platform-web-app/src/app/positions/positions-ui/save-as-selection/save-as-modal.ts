import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PositionHomeService } from '../position-home/position-home.service';

@Component({
  selector: 'save-as-modal',
  templateUrl: './save-as-modal.html',
  styleUrls: ['./save-as-modal.scss']
})
export class SaveAsModalComponent {
  @Input() currentPreset;
  @Input() saveAsModalShow = false;
  saveToCurrentDisabled = false;

  @Output() onClose = new EventEmitter();
  @Output() saveToNew = new EventEmitter();
  @Output() saveToCurrent = new EventEmitter();

  constructor(private readonly positionHomeService: PositionHomeService) {
    // this.saveToCurrentDisabled = !(
    //   this.positionHomeService.selectedPmsGridConfig && this.positionHomeService.selectedPmsWidgetConfig
    // );
    this.saveToCurrentDisabled = !this.positionHomeService.selectedPmsGridConfig;
  }
}
