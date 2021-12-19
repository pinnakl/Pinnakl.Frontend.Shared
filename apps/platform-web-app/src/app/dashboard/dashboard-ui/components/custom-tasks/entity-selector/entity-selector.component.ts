import { Component, forwardRef, Input, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

import * as _ from 'lodash';

import { ClientConnectivity } from '@pnkl-frontend/shared';

@Component({
  selector: 'entity-selector',
  templateUrl: 'entity-selector.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EntitySelectorComponent),
      multi: true
    }
  ]
})
export class EntitySelectorComponent implements ControlValueAccessor, OnInit {
  private allEntities: ClientConnectivity[];
  dropdownEntities: ClientConnectivity[];
  @Input() private entities: ClientConnectivity[];
  entityTypes = [
    {
      id: 1,
      description: 'PB'
    },
    {
      id: 2,
      description: 'ADMIN'
    }
  ];
  @Input() private filter: any;
  form: FormGroup;
  @Input() private showAllOption: boolean;
  @Input() showEntityTypeSelector: boolean;
  private propagateChange: any = () => {};

  ngOnInit(): void {
    this.allEntities = JSON.parse(JSON.stringify(this.entities));
    if (this.filter) {
      this.allEntities = _.filter(this.allEntities, this.filter);
    }
    if (this.showAllOption) {
      this.allEntities.push({
        id: 'all',
        entity: 'all'
      } as any);
    }
    this.dropdownEntities = this.allEntities;
    const entityId = new FormControl(),
      entityType = new FormControl();
    entityId.valueChanges.subscribe(this.onValueChanged.bind(this));
    entityType.valueChanges.subscribe(this.entityTypeChanged.bind(this));
    this.form = new FormGroup({ entityId, entityType });
  }

  onValueChanged(value: ClientConnectivity): void {
    this.propagateChange(value);
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}
  setDisabledState(isDisabled: boolean): void {}

  entityTypeChanged(entityType: string): void {
    this.form.patchValue({ entityId: undefined });
    this.dropdownEntities = _.filter(this.allEntities, [
      'entityType',
      entityType
    ]);
    if (this.dropdownEntities.length === 1) {
      this.form.patchValue({ entityId: this.dropdownEntities[0].id });
    } else {
      this.form.patchValue({ entityId: undefined });
    }
  }

  writeValue(value: ClientConnectivity): void {
    this.form.patchValue({ entityId: value });
  }
}
