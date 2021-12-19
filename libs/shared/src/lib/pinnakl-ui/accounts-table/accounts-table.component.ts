import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Account } from '@pnkl-frontend/shared';

enum AccountsTableType {
  SIMPLE = 'simple',
  ALLOCATION = 'allocation',
  CAPITAL_RATIOS = 'capital_ratios'
}

@Component({
  selector: 'app-accounts-table',
  templateUrl: './accounts-table.component.html',
  styleUrls: ['./accounts-table.component.scss']
})
export class AccountsTableComponent implements OnInit, OnChanges {
  @Input() disabled = false;
  @Input() isConfigurable = true;
  @Input() accounts: Account[];
  @Input() parentForm: FormGroup;
  @Input() initialSelectedAccounts: string[] = [];
  @Input() valuesForSelectedAccounts: { accountId: number, quantity: number, id?: number, parentOrderId?: number }[];
  @Input() type: AccountsTableType = AccountsTableType.SIMPLE;

  @Output() accountSelectionChanged: EventEmitter<FormGroup[]> = new EventEmitter<FormGroup[]>();
  @Output() accountsTableReady = new EventEmitter<boolean>();

  form: FormGroup;

  constructor(private readonly _fb: FormBuilder) {}

  get accountFormArray(): FormArray {
    return this.form?.get('accountsFormArray') as FormArray;
  }

  ngOnInit(): void {
    const accountsFormArray = this.accounts.map(account => {
      const isAccountInitiallySelected = this.initialSelectedAccounts.includes(account.id);
      const accountSelectedValue = this.valuesForSelectedAccounts?.find(v => v.accountId.toString() === account.id);
      return this._fb.group({
        allocationId: [accountSelectedValue?.id],
        parentOrderId: [accountSelectedValue?.parentOrderId],
        accountId: [account.id],
        accountCode: [account.accountCode],
        accountSelected: [!!accountSelectedValue || isAccountInitiallySelected],
        accountSelectedQuantity: [!!accountSelectedValue ? accountSelectedValue.quantity : 0]
      });
    });

    this.form = this._fb.group({
      accountsFormArray: this._fb.array(accountsFormArray, this.validateAccountsFormArray),
      allAccountsSelected: []
    });

    this.form.controls['accountsFormArray'].valueChanges.subscribe(() => {
      this.emitChanges();
    });

    this.form.controls['allAccountsSelected'].valueChanges.subscribe(value => {
      this.accountFormArray.patchValue(Array(this.accountFormArray.length).fill({ accountSelected: value }));
      this.parentForm.markAsDirty();
    });

    this.parentForm.addControl('accountsFormArray', this.accountFormArray);

    this.emitChanges();
    this.accountsTableReady.emit(true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.valuesForSelectedAccounts) {
      if (changes.valuesForSelectedAccounts?.currentValue?.length === 0) {
        this.accountFormArray?.patchValue(Array(this.accountFormArray.length).fill({ accountSelectedQuantity: 0 }));
      } else if (!changes.valuesForSelectedAccounts.firstChange) {
        this.accountFormArray?.controls.forEach(control => {
          control?.patchValue({
            accountSelectedQuantity:
              this.valuesForSelectedAccounts.find(v => v.accountId.toString() === control.value.accountId)?.quantity || 0
          });
        });
      }
    }
  }

  private validateAccountsFormArray(control: FormControl): object {
    return control.value.filter(v => v.accountSelected).length ? null : {
      validateAccountsFormArray: {
        valid: false,
        errorMessage: 'At least one account should be selected'
      }
    };
  }

  private getSelectedAccounts(): FormGroup[] {
    return (this.accountFormArray.controls as FormGroup[]).filter(accountFormItem => !!accountFormItem.controls['accountSelected'].value);
  }

  private emitChanges(): void {
    this.accountSelectionChanged.emit(this.getSelectedAccounts());
  }
}
