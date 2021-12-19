import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import * as _ from 'lodash';

import { Currency } from '@pnkl-frontend/shared';
import { Subscription } from 'rxjs';

@Component({
  selector: 'currency-dropdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './currency-dropdown.component.html'
})
export class CurrencyDropdownComponent implements OnDestroy, OnInit {
  @Input() currencies: Currency[];

  @Output() selectedCurrency = new EventEmitter<Currency>();

  currencySelectionForm: FormGroup;
  currencySubscription: Subscription;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.currencySelectionForm = this.fb.group({
      currency: [_.find(this.currencies, { currency: 'USD' })]
    });

    this.currencySubscription = this.currencySelectionForm.controls.currency.valueChanges.subscribe(
      (currency: Currency) => {
        if (currency) {
          this.selectedCurrency.emit(currency);
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.currencySubscription.unsubscribe();
  }
}
