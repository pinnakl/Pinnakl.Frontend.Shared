import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

import * as _ from 'lodash';

import { EntityDurationValidationService } from '@pnkl-frontend/shared';
import { AdminAccount } from '@pnkl-frontend/shared';
import { AdminIdentifier } from '@pnkl-frontend/shared';
import { AdminIdentifierService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { EntityIdentifiersComponent } from '../entity-identifiers.component';

@Component({
  selector: 'admin-identifiers',
  templateUrl: 'admin-identifiers.component.html'
})
export class AdminIdentifiersComponent extends EntityIdentifiersComponent {
  accounts: AdminAccount[];
  @Input() private adminAccounts: AdminAccount[];
  @Input() existingIdentifiers: AdminIdentifier[];
  identifiers: AdminIdentifier[];

  constructor(
    fb: FormBuilder,
    utility: Utility,
    private readonly adminIdentifierService: AdminIdentifierService,
    private readonly entityDurationValidationService: EntityDurationValidationService
  ) {
    super(fb, utility);
  }

  getAccountCode(accountId: number): string {
    return _.find(this.adminAccounts, { accountId: accountId }).accountCode;
  }

  getAdminCode(adminId: number): string {
    return _.find(this.entities, { adminId: adminId }).entity;
  }

  saveIdentifiers(): Promise<void[]> {
    const entities = this.identifiers,
      existingEntities = this.existingIdentifiers,
      savePromises = entities.reduce(
        (promises, entity) => {
          if (!entity.id) {
            promises.push(this.adminIdentifierService.postIdentifier(entity));
            return promises;
          }
          const existingEntity = _.find(existingEntities, { id: entity.id }),
            updatedEntity = this.getUpdatedIdentifier(entity, existingEntity);
          if (updatedEntity) {
            promises.push(
              this.adminIdentifierService.putIdentifier(updatedEntity)
            );
          }
          return promises;
        },
        [] as Promise<AdminIdentifier>[]
      ),
      deletePromises = existingEntities
        .filter(existingEntity => !_.some(entities, { id: existingEntity.id }))
        .map(existingEntity =>
          this.adminIdentifierService.deleteIdentifier(existingEntity.id)
        ),
      allPromises = deletePromises.concat(<any>savePromises);
    return allPromises.length > 0 ? Promise.all(allPromises) : null;
  }

  protected getUpdatedIdentifier(
    entity: AdminIdentifier,
    existingEntity: AdminIdentifier
  ): AdminIdentifier {
    const updatedEntity = {} as AdminIdentifier;
    const accountId = entity.accountId;
    if (!this.utility.compareNumeric(accountId, existingEntity.accountId)) {
      updatedEntity.accountId = accountId;
    }
    const adminId = entity.adminId;
    if (!this.utility.compareNumeric(adminId, existingEntity.adminId)) {
      updatedEntity.adminId = adminId;
    }
    const adminSecurityIdentifier = entity.adminSecurityIdentifier;
    if (
      !this.utility.compareStrings(
        adminSecurityIdentifier,
        existingEntity.adminSecurityIdentifier
      )
    ) {
      updatedEntity.adminSecurityIdentifier = adminSecurityIdentifier;
    }
    const endDate = entity.endDate;
    if (!this.utility.compareDates(endDate, existingEntity.endDate)) {
      updatedEntity.endDate = endDate;
    }
    const startDate = entity.startDate;
    if (!this.utility.compareDates(startDate, existingEntity.startDate)) {
      updatedEntity.startDate = startDate;
    }
    if (_.isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.id = existingEntity.id;
    return updatedEntity;
  }

  protected initializeForm(): void {
    this.form = this.fb.group({
      accountId: [, [Validators.required, this.validateAccount.bind(this)]],
      adminId: [, Validators.required],
      adminSecurityIdentifier: [, Validators.required],
      endDate: [, this.validateEndDate.bind(this)],
      pinnaklSecurityId: [this.security.id, Validators.required],
      startDate: []

    });
    this.accounts = _.uniqBy(this.adminAccounts, 'accountId');
  }

  protected triggerFormValidation(): void {
    this.form.controls.accountId.updateValueAndValidity();
    this.form.controls.endDate.updateValueAndValidity();
  }

  protected updateForm(identifier: AdminIdentifier): void {
    this.form.patchValue({
      accountId: identifier.accountId,
      adminId: identifier.adminId,
      adminSecurityIdentifier: identifier.adminSecurityIdentifier,
      endDate: identifier.endDate,
      pinnaklSecurityId: identifier.pinnaklSecurityId,
      startDate: identifier.startDate
    });
  }

  private similarIdentifierActive(identifier: AdminIdentifier): boolean {
    return this.identifiers.some(
      existingIdentifier =>
        existingIdentifier.adminId === identifier.adminId &&
        existingIdentifier.accountId === identifier.accountId &&
        !this.entityDurationValidationService.validate(
          existingIdentifier,
          identifier
        )
    );
  }

  private validateAccount(fc: FormControl): {
    validateAccount: {
      valid: boolean;
      errorMessage: string;
    };
  } {
    if (!this.form) {
      return null;
    }
    const identifier: AdminIdentifier = this.form.value,
      adminId = identifier.adminId;
    if (!identifier.adminId) {
      return null;
    }
    const accountId: number = fc.value,
      result = this.adminAccounts.some(
        aa => aa.adminId === adminId && aa.accountId === accountId
      );
    return result
      ? null
      : {
        validateAccount: {
          valid: false,
          errorMessage: 'Invalid Account'
        }
      };
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
    const identifier: AdminIdentifier = _.clone(this.form.value);
    if (!identifier.adminId || !identifier.accountId) {
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
      const result = this.similarIdentifierActive(identifier);
      return !result
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
}
