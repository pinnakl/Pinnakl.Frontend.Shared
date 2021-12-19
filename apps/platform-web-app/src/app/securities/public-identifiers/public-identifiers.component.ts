import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import * as _ from 'lodash';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { EntityDurationValidationService } from '@pnkl-frontend/shared';
import { GenericEntityWithName } from '@pnkl-frontend/shared';
import { Market } from '@pnkl-frontend/shared';
import { PublicIdentifier } from '@pnkl-frontend/shared';
import { SecurityMarket } from '@pnkl-frontend/shared';
import { Security } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../shared/securities-helper.service';
import { MarketIdentifier } from './market-identifier.model';
import { PublicIdentifiersProcessingService } from './public-identifiers-processing.service';

@Component({
  selector: 'public-identifiers',
  templateUrl: 'public-identifiers.component.html',
  styleUrls: ['./public-identifiers.component.scss']
})
export class PublicIdentifiersComponent implements OnInit {
  confirmationVisible = false;
  @Input() existingIdentifiers: PublicIdentifier[];
  @Input() existingSecurityMarkets: SecurityMarket[];
  form: FormGroup;
  @Input() markets: Market[];
  @Input() publicIdentifierTypes: GenericEntityWithName[];
  @Input() security: Security;
  marketIdentifiers: MarketIdentifier[];
  submitted = false;

  constructor(
    private readonly entityDurationValidationService: EntityDurationValidationService,
    private readonly fb: FormBuilder,
    private readonly pinnaklSpinner: PinnaklSpinner,
    private readonly publicIdentifiersProcessingService: PublicIdentifiersProcessingService,
    private readonly securitiesHelper: SecuritiesHelper,
    private readonly toastr: Toastr,
    private readonly utility: Utility
  ) { }

  deleteIdentifier(identifier: PublicIdentifier): void {
    const marketIdentifiers = this.marketIdentifiers,
      marketIdentifier = this.getMarketIdentifier(identifier.marketId),
      identifiers = marketIdentifier.identifiers,
      indexToDelete = identifiers.indexOf(identifier);
    identifiers.splice(indexToDelete, 1);
    if (identifiers.length === 0) {
      marketIdentifiers.splice(marketIdentifiers.indexOf(marketIdentifier), 1);
    }
  }

  editIdentifier(identifier: PublicIdentifier): void {
    this.deleteIdentifier(identifier);
    if (identifier.id) {
      this.form.addControl('id', this.fb.control(identifier.id));
    }
    this.form.patchValue({
      endDate: identifier.endDate,
      identifier: identifier.identifier,
      marketId: identifier.marketId,
      identifierType: identifier.identifierType,
      securityId: identifier.securityId,
      startDate: identifier.startDate
    });
  }

  hideConfirmation(): void {
    this.confirmationVisible = false;
  }

  identifierTypeWithoutMarket(identifierType: string): boolean {
    if (!identifierType) {
      return false;
    }
    return _.includes(['isin', 'cusip'], identifierType.toLowerCase());
  }

  ngOnInit(): void {
    this.initializeMarketIdentifiers();
    this.initializeForm();
  }

  onFormSubmit(): void {
    this.form.controls.endDate.updateValueAndValidity();
    this.form.controls.marketId.updateValueAndValidity();
    this.submitted = true;
    if (!this.form.valid) {
      return;
    }
    if (this.identifierTypeWithoutMarket(this.form.value.identifierType)) {
      this.form.patchValue({ marketId: null });
    }
    this.showNewMarketPrompt();
  }

  async saveAllIdentifiers(): Promise<void> {
    this.pinnaklSpinner.spin();
    try {
      const {
        errorMessage,
        identifiers,
        securityMarkets
      } = await this.publicIdentifiersProcessingService.saveAllIdentifiers(
        this.existingIdentifiers,
        this.existingSecurityMarkets,
        this.getIdentifiers(),
        this.security.id,
        this.marketIdentifiers
          .filter(mi => mi.securityMarket)
          .map(mi => mi.securityMarket)
      );
      this.pinnaklSpinner.stop();
      if (errorMessage) {
        this.toastr.error(errorMessage);
        return;
      }
      if (!identifiers && !securityMarkets) {
        return;
      }
      this.toastr.success('Changes saved successfully');
      if (identifiers) {
        this.existingIdentifiers = identifiers;
      }
      if (securityMarkets) {
        this.existingSecurityMarkets = securityMarkets;
      }
      this.ngOnInit();
      this.securitiesHelper.formSubmitted.next();
    } catch (e) {
      this.utility.showError(e);
    }
  }

  saveIdentifier(): void {
    this.confirmationVisible = false;
    const identifierToAdd: PublicIdentifier = this.form.value,
      marketIdentifier = this.getMarketIdentifier(identifierToAdd.marketId);
    if (marketIdentifier) {
      marketIdentifier.identifiers.push(identifierToAdd);
    } else {
      let securityMarket: SecurityMarket;
      const existingSecurityMarket = _.find(this.existingSecurityMarkets, [
        'marketId',
        identifierToAdd.marketId
      ]);
      if (existingSecurityMarket) {
        securityMarket = _.clone(existingSecurityMarket);
      } else {
        const market = _.find(this.markets, ['id', identifierToAdd.marketId]);
        securityMarket = !market
          ? undefined
          : ({
            activeTradingIndicator: true,
            marketId: identifierToAdd.marketId,
            mic: market.mic,
            primaryMarketIndicator: false,
            securityId: this.security.id
          } as SecurityMarket);
      }
      this.marketIdentifiers.push({
        securityMarket,
        identifiers: [identifierToAdd]
      });
    }
    this.resetForm();
  }

  private getIdentifiers(): PublicIdentifier[] {
    return this.marketIdentifiers.reduce(
      (identifiers, marketIdentifier) =>
        identifiers.concat(marketIdentifier.identifiers),
      []
    );
  }

  private getMarketIdentifier(marketId: number): MarketIdentifier {
    return this.marketIdentifiers.find(marketIdentifier =>
      !marketId
        ? !marketIdentifier.securityMarket
        : marketIdentifier.securityMarket &&
        marketIdentifier.securityMarket.marketId === marketId
    );
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      endDate: [, this.validateEndDate.bind(this)],
      identifier: [, Validators.required],
      identifierType: [, Validators.required],
      marketId: [, this.validateMarket.bind(this)],
      securityId: [this.security.id, Validators.required],
      startDate: []
    });
  }

  private initializeMarketIdentifiers(): void {
    const existingIdentifiers = this.existingIdentifiers;
    if (!(existingIdentifiers && existingIdentifiers.length > 0)) {
      this.marketIdentifiers = [];
      return;
    }
    const marketIdIdentifiersDictionary = _.groupBy(
      existingIdentifiers,
      'marketId'
    ),
      marketIdentifiers = Object.keys(marketIdIdentifiersDictionary).map(
        key => {
          const marketIdParsed = parseInt(key),
            marketId = !isNaN(marketIdParsed) ? marketIdParsed : null,
            securityMarket = _.find(this.existingSecurityMarkets, [
              'marketId',
              marketId
            ]);
          return {
            securityMarket: _.clone(securityMarket),
            identifiers: marketIdIdentifiersDictionary[marketId]
          };
        }
      );
    this.marketIdentifiers = marketIdentifiers;
  }

  private resetForm(): void {
    this.submitted = false;
    this.form.reset();
    this.form.patchValue({ securityId: this.security.id });
    this.form.removeControl('id');
  }

  private showNewMarketPrompt(): void {
    const identifier: PublicIdentifier = this.form.value,
      marketId = identifier.marketId;
    if (
      marketId &&
      !_(this.marketIdentifiers).some(['securityMarket.marketId', marketId])
    ) {
      this.confirmationVisible = true;
      return;
    }
    this.saveIdentifier();
  }

  private similarIdentifierActive(
    existingIdentifiers: PublicIdentifier[],
    identifier: PublicIdentifier
  ): boolean {
    const identifierType = identifier.identifierType.toLowerCase();
    if (this.identifierTypeWithoutMarket(identifierType)) {
      return existingIdentifiers.some(
        existingIdentifier =>
          existingIdentifier.identifierType.toLowerCase() === identifierType &&
          !this.entityDurationValidationService.validate(
            identifier,
            existingIdentifier
          )
      );
    } else {
      if (!identifier.marketId) {
        return false;
      }
      return existingIdentifiers.some(
        existingIdentifier =>
          existingIdentifier.identifierType.toLowerCase() === identifierType &&
          existingIdentifier.marketId === identifier.marketId &&
          !this.entityDurationValidationService.validate(
            existingIdentifier,
            identifier
          )
      );
    }
  }

  private validateEndDate(fc: FormControl): {
    validateEndDate: {
      valid: boolean;
      errorMessage: string;
    };
  } {
    if (!this.form) {
      return null;
    }
    const identifier: PublicIdentifier = _.clone(this.form.value);
    if (!identifier.identifierType) {
      return null;
    }
    const endDate: Date = fc.value,
      startDate = identifier.startDate;
    identifier.endDate = endDate;
    if (
      !startDate ||
      !endDate ||
      this.utility.compareDatesWithoutTime(endDate, startDate) > 0
    ) {
      return !this.similarIdentifierActive(this.getIdentifiers(), identifier)
        ? null
        : {
          validateEndDate: {
            valid: false,
            errorMessage:
              'Multiple identifiers will become active within the same period'
          }
        };
    }
    return {
      validateEndDate: {
        valid: false,
        errorMessage: 'Invalid End Date'
      }
    };
  }

  private validateMarket(fc: FormControl): {
    validateMarket: {
        valid: boolean;
        errorMessage: string;
    };
} {
    if (!this.form) {
      return null;
    }
    const identifier: PublicIdentifier = this.form.value;
    if (!identifier.identifierType) {
      return null;
    }
    const identifierType = identifier.identifierType,
      marketId: number = fc.value;
    if (!this.identifierTypeWithoutMarket(identifierType) && !marketId) {
      return {
        validateMarket: {
          valid: false,
          errorMessage: 'REQUIRED'
        }
      };
    }
    return null;
  }
}
