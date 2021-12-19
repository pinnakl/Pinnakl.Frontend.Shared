import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { SecurityService } from '@pnkl-frontend/shared';

// eslint-disable-next-line no-shadow
const enum IdentifierTypes {
  ISIN = 'isin',
  SEDOL = 'sedol',
  CUSIP = 'cusip',
  TICKER = 'ticker',
  OSI = 'osisymbol'
}
const allIdentifierTypes = [
  IdentifierTypes.ISIN,
  IdentifierTypes.SEDOL,
  IdentifierTypes.CUSIP,
  IdentifierTypes.TICKER,
  IdentifierTypes.OSI
];

@Component({
  selector: 'add-security-automatic',
  templateUrl: 'add-security-automatic.component.html',
  styleUrls: ['add-security-automatic.component.scss']
})
export class AddSecurityAutomaticComponent implements OnInit {
  @Input() defaultAssetType = 'equity';
  @Input() hideAssetTypes = false;
  @Input() allowedAssetTypes: string[] = ['Equity', 'Option', 'Bond', 'ETF'];
  @Output() hideSecurityAutomaticModal =  new EventEmitter<boolean>();
  automaticSecurityForm: FormGroup;
  identifierTypes = allIdentifierTypes;
  submitted = false;
  isCusipSearchEmpty = false;
  cusips = [];
  constructor(
    private readonly fb: FormBuilder,
    private readonly pinnaklSpinner: PinnaklSpinner,
    private readonly securityService: SecurityService,
    private readonly toastr: Toastr,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initializeAddSecurityAutomaticallyForm();
  }

  addSecurityAutomatically(form: FormGroup): void {
    this.submitted = true;
    if (!form.valid) {
      return;
    }

    let { identifier, identifierType }: { identifier: string; identifierType: string } = form.value;
    const cusip = form.value.cusip;

    if (identifierType === IdentifierTypes.TICKER && !cusip) {
      this.searchCusips(identifier);
      return;
    }

    if (cusip) {
      identifierType = IdentifierTypes.CUSIP;
      identifier = cusip;
      this.clearCusips();
    }

    this.pinnaklSpinner.spin();
    this.securityService
      .saveSecurityAutomatically(true, identifierType, identifier)
      .then(security => {
        this.pinnaklSpinner.stop();
        this.toastr.success('Security added successfully');
        this.hideSecurityAutomaticModal.emit(true);
        window.open(`${window.location.origin}/#/securities/security-details/${security.assetTypeId}/${security.assetType};securityId=${security.id}`, '_blank');
      })
      .catch((err) => {
        this.toastr.error('Unable to setup Security from ICE');
        console.error('Error while addSecurityAutomatically', err);
      });
  }

  private searchCusips(identifier: string): void {
    this.pinnaklSpinner.spin();
    this.securityService.getCusipsByTicker(identifier)
      .subscribe((cusips: { cusip: string}[] ) => {
        if (cusips?.length === 1) {
          this.isCusipSearchEmpty = false;
          this.clearCusips();
          this.automaticSecurityForm.get('identifierType').setValue(IdentifierTypes.CUSIP);
          this.automaticSecurityForm.get('identifier').setValue(cusips[0].cusip);
          this.addSecurityAutomatically(this.automaticSecurityForm);
        } else if (cusips?.length >= 2) {
          this.cusips = cusips;
          this.automaticSecurityForm.get('cusip').setValidators([Validators.required]);
          this.isCusipSearchEmpty = false;
          this.pinnaklSpinner.stop();
        } else {
          this.clearCusips();
          this.pinnaklSpinner.stop();
          this.isCusipSearchEmpty = true;
        }

        this.cdr.detectChanges();
      }, (err: HttpErrorResponse) => {
        this.toastr.error('Unable to setup Security from ICE');
        console.error('Error while searchCusips', err);
      });
  }

  private get getDefaultIdentifierType(): IdentifierTypes {
    switch ( this.defaultAssetType.toLowerCase() ) {
      case 'equity':
        return IdentifierTypes.TICKER;
      default:
        return null;
    }
  }

  private get getAssetType(): string {
    switch ( this.defaultAssetType ) {
      case 'equity':
        return 'Equity';
      case 'option':
        return 'Option';
      default:
        return null;
    }
  }

  private initializeAddSecurityAutomaticallyForm(): void {
    this.automaticSecurityForm = this.fb.group({
      assetType: [null, Validators.required],
      identifier: [null, [Validators.required, this.validateIdentifier.bind(this)]],
      identifierType: [this.getDefaultIdentifierType, Validators.required],
      cusip: null
    });

    this.automaticSecurityForm.valueChanges.subscribe(() => this.isCusipSearchEmpty = false);

    this.automaticSecurityForm.controls[
      'identifierType'
      ].valueChanges.subscribe(() => {
      this.clearCusips();
      if (!this.automaticSecurityForm.controls['identifier'].value) {
        return null;
      }
      this.automaticSecurityForm.controls[
        'identifier'
        ].updateValueAndValidity();
    });

    this.automaticSecurityForm.controls['identifier'].valueChanges.subscribe(() => this.clearCusips());

    this.automaticSecurityForm.controls['assetType'].valueChanges.subscribe(value => {
      this.clearCusips();
      if (!value) {
        return null;
      }
      switch (value) {
        case 'Option': {
          this.identifierTypes = [IdentifierTypes.OSI];
          this.automaticSecurityForm.controls[
            'identifierType'
            ].patchValue(IdentifierTypes.OSI);
          break;
        }
        case 'Bond': {
          this.identifierTypes = [IdentifierTypes.ISIN, IdentifierTypes.CUSIP];
          break;
        }
        case 'ETF':
        case 'Equity': {
          this.identifierTypes = allIdentifierTypes;
          this.automaticSecurityForm.get('identifierType').setValue(IdentifierTypes.TICKER);
          break;
        }
      }
      this.automaticSecurityForm.controls[
        'identifierType'
        ].updateValueAndValidity();
      this.automaticSecurityForm.controls[
        'identifier'
        ].updateValueAndValidity();
    });

    this.automaticSecurityForm.get('assetType').setValue(this.getAssetType);
  }

  private checkSedol(text: string): boolean {
    try {
      const input = text.substr(0, 6),
        checkDigit = sedolCheckDigit(input);
      return text === input + checkDigit;
    } catch (e) {
      return false;
    }

    function sedolCheckDigit(char6: string): string {
      if (char6.search(/^[0-9BCDFGHJKLMNPQRSTVWXYZ]{6}$/) === -1) {
        throw `Invalid SEDOL number '${char6}'`; // tslint:disable-line:no-string-throw
      }
      let sum = 0;
      const weight = [1, 3, 1, 7, 3, 9, 1];
      for (let i = 0; i < char6.length; i++) {
        sum += weight[i] * parseInt(char6.charAt(i), 36);
      }
      return ((10 - (sum % 10)) % 10).toString();
    }
  }
  private validateIdentifier(identifierFormControl: FormControl): {
    validateIdentifier: {
        valid: boolean;
        errorMessage: string;
    };
} {
    if (!this.automaticSecurityForm) {
      return null;
    }
    const identifierType: string = this.automaticSecurityForm.controls[
        'identifierType'
      ].value,
      identifierValue: string = identifierFormControl.value,
      error = {
        validateIdentifier: {
          valid: false,
          errorMessage: 'Not a valid identifier'
        }
      };
    switch (identifierType) {
      case 'cusip':
        return identifierValue?.length === 9 ? null : error;
      case 'isin':
        return identifierValue?.length === 12 ? null : error;
      case 'sedol':
        return this.checkSedol(identifierValue) ? null : error;
      default:
        return null;
    }
  }

  private clearCusips(): void {
    this.cusips = [];
    this.automaticSecurityForm.get('cusip').setValidators(null);
    this.automaticSecurityForm.get('cusip').setValue(null, { emitEvent: false });
  }
}
