import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { PositionsPnlDataField } from '@pnkl-frontend/shared';

@Component({
  selector: 'pnl-add-widget',
  templateUrl: './pnl-add-widget.component.html',
  styleUrls: ['./pnl-add-widget.component.scss']
})
export class PnlAddWidgetComponent implements OnInit {
  @Input() pnlFields: PositionsPnlDataField[];
  @Output() AddPnlFields: EventEmitter<number[]> = new EventEmitter<number[]>();
  @Output() saveWidgets: EventEmitter<void> = new EventEmitter<void>();

  private _selectedPnlFieldIds = [];
  @Input()
  set selectedPnlFieldIds(value: number[]) {
    this._selectedPnlFieldIds = value;
    this._updateForm();
  }

  form: FormGroup;
  securityAttributesData: PositionsPnlDataField[];
  showPnlFieldConfig = false;
  submitted = false;
  tradeTagsData: PositionsPnlDataField[];

  constructor(private readonly fb: FormBuilder) {
    this._createForm();
  }

  ngOnInit(): void {
    this.tradeTagsData = this.pnlFields.filter(
      pnlField => pnlField.type === 'attribute'
    );
    this.securityAttributesData = this.pnlFields.filter(
      pnlField => pnlField.type === 'security'
    );
    this._updateForm();
  }

  formReset(): void {
    this._updateForm();
  }

  onClose(): void {
    this.showPnlFieldConfig = false;
  }

  onSubmit(): void {
    this.submitted = true;
    this.AddPnlFields.emit(
      this.form.value.securityAttributes.concat(this.form.value.tradeTags)
    );
    this.showPnlFieldConfig = false;
  }

  private _createForm(): void {
    this.form = this.fb.group({
      tradeTags: [],
      securityAttributes: []
    });
  }

  private _updateForm(): void {
    if (!this._selectedPnlFieldIds) {
      return;
    }
    const securityAttributes = this.securityAttributesData
      ? this._selectedPnlFieldIds.filter(id =>
          this.securityAttributesData.some(x => x.id === id)
        )
      : [];
    const tradeTags = this.tradeTagsData
      ? this._selectedPnlFieldIds.filter(id =>
          this.tradeTagsData.some(x => x.id === id)
        )
      : [];
    this.form.patchValue({
      securityAttributes,
      tradeTags
    });
  }
}
