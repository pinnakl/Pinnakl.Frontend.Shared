import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdminIdentifier, ClientConnectivity, PbIdentifier, Security, Utility } from '@pnkl-frontend/shared';
import * as _ from 'lodash';

type EntityIdentifier = AdminIdentifier | PbIdentifier;

@Component({ template: '' })
export abstract class EntityIdentifiersComponent<T = any> implements OnChanges, OnInit {
  @Input() entities: ClientConnectivity[];
  @Input() existingIdentifiers: EntityIdentifier[];
  form: FormGroup;
  identifiers: EntityIdentifier[];
  @Input() security: Security;
  submitted = false;

  constructor(protected fb: FormBuilder, protected utility: Utility) {}

  deleteIdentifier(identifier: EntityIdentifier): void {
    this.identifiers.splice(this.identifiers.indexOf(identifier), 1);
  }

  editIdentifier(identifier: EntityIdentifier): void {
    this.deleteIdentifier(identifier);
    if (identifier.id) {
      this.form.addControl('id', this.fb.control(identifier.id));
    }
    this.updateForm(identifier);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes.existingIdentifiers;
    if (change && !change.isFirstChange()) {
      this.resetIdentifiersAndForm();
    }
  }

  ngOnInit(): void {
    this.resetIdentifiers();
    this.initializeForm();
  }

  resetIdentifiersAndForm(): void {
    this.resetIdentifiers();
    this.resetForm();
  }

  saveIdentifier(): void {
    this.triggerFormValidation();
    this.submitted = true;
    if (!this.form.valid) {
      return;
    }
    const identifier = this.form.value as EntityIdentifier;
    this.identifiers.push(identifier);
    this.resetForm();
  }

  abstract saveIdentifiers(): Promise<void[]>;
  protected abstract getUpdatedIdentifier(
    entity: EntityIdentifier,
    existingEntity: EntityIdentifier
  ): EntityIdentifier;
  protected abstract initializeForm(): void;
  protected abstract updateForm(identifier: EntityIdentifier): void;

  protected triggerFormValidation(): void {}

  private resetIdentifiers(): void {
    this.identifiers = _.cloneDeep(this.existingIdentifiers);
  }

  private resetForm(): void {
    this.submitted = false;
    this.form.reset();
    this.form.patchValue({ pinnaklSecurityId: this.security.id });
    this.form.removeControl('id');
  }
}
