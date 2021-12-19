import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { ClientConnectivity } from '@pnkl-frontend/shared';
import * as _ from 'lodash';
@Component({
  selector: 'custom-task-summary',
  templateUrl: 'custom-task-summary.component.html',
  animations: [
    trigger('listOfPropsChanged', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ])
    ])
  ]
})
export class CustomTaskSummaryComponent implements OnChanges {
  @Input() entities: ClientConnectivity[];
  @Input() properties: any;
  propertiesData: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes.properties && changes.properties.currentValue) ||
      (changes.entities && changes.entities.currentValue)
    ) {
      this.propertiesData = this.getProperties();
    }
  }

  getProperties(): any {
    const entities = this.entities,
      properties = JSON.parse(JSON.stringify(this.properties));
    if (!properties || !(entities && entities.length > 0)) {
      return properties;
    }
    const entityIdProperty = Object.keys(properties).find(
        key => key.toLowerCase() === 'entityid'
      ),
      entityId = properties[entityIdProperty];
    if (!entityId) {
      return properties;
    }
    delete properties[entityIdProperty];
    const entity = _.find(entities, ['id', parseInt(entityId)]);
    if (entity) {
      properties.entity = entity.entity;
    }
    return properties;
  }
}
