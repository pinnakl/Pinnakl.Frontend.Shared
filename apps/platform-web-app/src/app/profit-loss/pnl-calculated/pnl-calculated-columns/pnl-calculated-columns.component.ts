import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

import { Subscription } from 'rxjs';
import { PnlCalculatedColumnSelection } from '../../shared/pnl-ui-state/store';

@Component({
  selector: 'pnl-calculated-columns',
  templateUrl: './pnl-calculated-columns.component.html',
  styleUrls: ['./pnl-calculated-columns.component.scss']
})
export class PnlCalculatedColumnsComponent implements OnChanges, OnDestroy {
  @Input() pnlCalculatedColumnSelections: PnlCalculatedColumnSelection[];
  @Output() private onAdd = new EventEmitter<string>();
  @Output() private onRemove = new EventEmitter<string>();

  formGroup: FormGroup;
  private subscription: Subscription;

  get formArray(): FormArray {
    const formArray = this.formGroup.get('entities') as FormArray;
    return formArray;
  }

  constructor(private readonly fb: FormBuilder) {}

  ngOnChanges({ pnlCalculatedColumnSelections }: SimpleChanges): void {
    this.formGroup = this.fb.group({
      entities: this.fb.array(
        (<PnlCalculatedColumnSelection[]>(
          pnlCalculatedColumnSelections.currentValue
        )).map(({ selected }) =>
          this.fb.group({
            selected: [selected]
          })
        )
      )
    });
    this.unsubscribe();
    this.subscription = this.formGroup.valueChanges.subscribe(
      ({ entities }: { entities: { selected: boolean }[] }) => {
        const changedSelection = this.pnlCalculatedColumnSelections.find(
          ({ selected }, i) => selected !== entities[i].selected
        );
        if (!changedSelection) {
          return;
        }
        if (!changedSelection.selected) {
          this.onAdd.emit(changedSelection.name);
        } else {
          this.onRemove.emit(changedSelection.name);
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  private unsubscribe(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
