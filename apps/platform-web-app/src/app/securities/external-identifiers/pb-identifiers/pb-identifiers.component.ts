import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

import * as _ from 'lodash';

import { PbIdentifier } from '@pnkl-frontend/shared';
import { PbIdentifierService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { EntityIdentifiersComponent } from '../entity-identifiers.component';

@Component({
  selector: 'pb-identifiers',
  templateUrl: 'pb-identifiers.component.html'
})
export class PbIdentifiersComponent extends EntityIdentifiersComponent {
  @Input() existingIdentifiers: PbIdentifier[];
  identifiers: PbIdentifier[];

  constructor(
    fb: FormBuilder,
    utility: Utility,
    private readonly pbIdentifierService: PbIdentifierService
  ) {
    super(fb, utility);
  }

  getCustodianCode(custodianId: number): string {
    return _.find(this.entities, ['custodianId', custodianId]).entity;
  }

  saveIdentifiers(): Promise<void[]> {
    const entities = this.identifiers,
      existingEntities = this.existingIdentifiers,
      savePromises = entities.reduce(
        (_promises, entity) => {
          if (!entity.id) {
            _promises.push(this.pbIdentifierService.postIdentifier(entity));
            return _promises;
          }
          const existingEntity = _.find(existingEntities, ['id', entity.id]),
            updatedEntity = this.getUpdatedIdentifier(entity, existingEntity);
          if (updatedEntity) {
            _promises.push(
              this.pbIdentifierService.putIdentifier(updatedEntity)
            );
          }
          return _promises;
        },
        [] as Promise<PbIdentifier>[]
      ),
      deletePromises = existingEntities
        .filter(existingEntity => !_.some(entities, ['id', existingEntity.id]))
        .map(existingEntity =>
          this.pbIdentifierService.deleteIdentifier(existingEntity.id)
        );
    const promises = deletePromises.concat(<any>savePromises);
    return promises.length > 0 ? Promise.all(promises) : null;
  }

  protected getUpdatedIdentifier(
    entity: PbIdentifier,
    existingEntity: PbIdentifier
  ): PbIdentifier {
    const updatedEntity = {} as PbIdentifier;
    const custodianId = entity.custodianId;
    if (!this.utility.compareNumeric(custodianId, existingEntity.custodianId)) {
      updatedEntity.custodianId = custodianId;
    }
    const externalIdentifier = entity.externalIdentifier;
    if (
      !this.utility.compareStrings(
        externalIdentifier,
        existingEntity.externalIdentifier
      )
    ) {
      updatedEntity.externalIdentifier = externalIdentifier;
    }
    if (_.isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.id = existingEntity.id;
    return updatedEntity;
  }

  protected initializeForm(): void {
    this.form = this.fb.group({
      custodianId: [,
        [Validators.required, this.validateCustodianId.bind(this)]
      ],
      externalIdentifier: [, Validators.required],
      pinnaklSecurityId: [this.security.id, Validators.required]
    });
  }

  protected updateForm(identifier: PbIdentifier): void {
    this.form.patchValue({
      custodianId: identifier.custodianId,
      externalIdentifier: identifier.externalIdentifier,
      pinnaklSecurityId: identifier.pinnaklSecurityId
    });
  }

  private validateCustodianId(fc: FormControl): {
    validateCustodianId: {
      valid: boolean;
      errorMessage: string;
    };
  } {
    const custodianId: number = fc.value;
    return !_.some(this.identifiers, ['custodianId', custodianId])
      ? null
      : {
        validateCustodianId: {
          valid: false,
          errorMessage: 'PB identifier already exists'
        }
      };
  }
}
