import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PMSConfigType, SavePresetFormData } from '../position-home/position-home.service';

@Component({
  selector: 'create-preset-modal',
  templateUrl: './create-preset-modal.html',
  styleUrls: ['./create-preset-modal.scss']
})
export class CreatePresetModalComponent implements OnInit {
  PMSConfigType = PMSConfigType;
  savePresetForm: FormGroup;

  @Input() savePresetModalShow: boolean;

  @Output() onClose = new EventEmitter();
  @Output() onSave = new EventEmitter<SavePresetFormData>();

  ngOnInit(): void {
    const formData = {
      presetName: 'Preset 1',
      presetType: PMSConfigType.GRID
    };

    this.savePresetForm = new FormGroup({
      presetName: new FormControl(formData.presetName, Validators.required),
      presetType: new FormControl(formData.presetType, Validators.required)
    });
  }

  savePreset(): void {
    this.onSave.emit(this.savePresetForm.value);
  }
}
