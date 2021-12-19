import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subscription } from 'rxjs';

import { PositionsPnlDataField } from '@pnkl-frontend/shared';

@Component({
  selector: 'pnl-realtime-field-selector',
  templateUrl: './pnl-realtime-field-selector.component.html',
  styleUrls: ['./pnl-realtime-field-selector.component.scss']
})
export class PnlRealtimeFieldSelectorComponent implements OnDestroy {
  @Input() pnlFields: PositionsPnlDataField[];
  @Input() set pnlFieldsSelected(value: number[]) {
    const pnlFieldSelected = value && value.length ? value[0] : null;
    const existingValue = this.formGroup.value.pnlFieldSelected;
    if (pnlFieldSelected !== existingValue) {
      this.formGroup.patchValue({ pnlFieldSelected });
    }
  }
  @Output() fieldsChanged = new EventEmitter<number[]>();

  formGroup: FormGroup;
  subscription: Subscription;

  constructor(private readonly fb: FormBuilder) {
    this.createForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private createForm(): void {
    this.formGroup = this.fb.group({
      pnlFieldSelected: []
    });
    this.subscription = this.formGroup
      .get('pnlFieldSelected')
      .valueChanges.subscribe(value => {
        if (!value) {
          return;
        }
        this.fieldsChanged.emit([value]);
      });
  }
}
