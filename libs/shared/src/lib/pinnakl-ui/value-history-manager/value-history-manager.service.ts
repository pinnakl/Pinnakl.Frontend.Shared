import { Injectable } from '@angular/core';

import { cloneDeep, differenceBy, find, isEqual } from 'lodash';
import { BehaviorSubject } from 'rxjs';

import { PinnaklSpinner, Toastr } from '@pnkl-frontend/core';
import { EntityDurationValidationService } from '../../services/entity-duration-validation/entity-duration-validation.service';
import { Utility } from '../../services/utility.service';
import { ValueHistoryItem } from './value-history-item.model';

@Injectable()
export class ValueHistoryManagerService {
  currentValueHistoryItems: ValueHistoryItem[] = [];
  valueHistoryItemToEdit$ = new BehaviorSubject<ValueHistoryItem>(null);
  private existingValueHistoryItems: ValueHistoryItem[] = [];

  constructor(
    private readonly entityDurationValidationService: EntityDurationValidationService,
    private readonly pinnaklSpinner: PinnaklSpinner,
    private readonly toastr: Toastr,
    private readonly utility: Utility
  ) { }

  addHistoryItem(valueHistoryItem: ValueHistoryItem): void {
    this.currentValueHistoryItems = [
      ...this.currentValueHistoryItems,
      valueHistoryItem
    ];
    this.valueHistoryItemToEdit$.next(null);
  }

  deleteHistoryItem(valueHistoryItem: ValueHistoryItem): void {
    this.currentValueHistoryItems = this.currentValueHistoryItems.filter(
      x => x !== valueHistoryItem
    );
  }

  editHistoryItem(valueHistoryItem: ValueHistoryItem): void {
    this.deleteHistoryItem(valueHistoryItem);
    this.valueHistoryItemToEdit$.next(valueHistoryItem);
  }

  getCurrentHistoryValue(): number {
    let currentHistoryValue = this.currentValueHistoryItems.find(historyValue =>
      this.utility.isDateInBetween(
        new Date(),
        historyValue.startDate,
        historyValue.endDate
      )
    );
    if (currentHistoryValue) {
      return currentHistoryValue.value;
    }
    return null;
  }

  async loadHistory(
    fetchHistoryItems: () => Promise<ValueHistoryItem[]>
  ): Promise<void> {
    try {
      this.pinnaklSpinner.spin();
      this.existingValueHistoryItems = await fetchHistoryItems();
      this.currentValueHistoryItems = cloneDeep(this.existingValueHistoryItems);
    } catch (e) {
      this.utility.showError(e);
    } finally {
      this.pinnaklSpinner.stop();
    }
  }

  async saveAllHistoryItems(
    fetchHistoryItems: () => Promise<ValueHistoryItem[]>,
    saveAllHistoryItems: (x: {
      add: ValueHistoryItem[];
      delete: ValueHistoryItem[];
      update: ValueHistoryItem[];
    }) => Promise<void>
  ): Promise<void> {
    const valid = this.historyItemsValid();
    if (!valid) {
      this.toastr.error('Please ensure an entity is active at all times');
      return;
    }
    const itemsToSave = this.getValueHistoryItemsToSave();
    if (!itemsToSave) {
      this.toastr.info('No changes to update!');
      return;
    }
    try {
      this.pinnaklSpinner.spin();
      await saveAllHistoryItems(itemsToSave);
      await this.loadHistory(fetchHistoryItems);
      this.valueHistoryItemToEdit$.next(null);
      this.toastr.success('Data saved successfully');
      this.pinnaklSpinner.stop();
    } catch (e) {
      this.utility.showError(e);
    }
  }

  validateValueDates(startDate: Date, endDate: Date): {} {
    return this.entityDurationValidationService.validateAgainstExistingEntities(
      { endDate, startDate },
      this.currentValueHistoryItems
    );
  }

  private historyItemsValid(): boolean {
    return !this.entityDurationValidationService.someDurationMissing(
      this.currentValueHistoryItems
    );
  }

  private getUpdatedValueHistoryItem(
    entity: ValueHistoryItem,
    existingEntity: ValueHistoryItem
  ): ValueHistoryItem {
    let updatedEntity = {} as ValueHistoryItem;
    let endDate = entity.endDate;
    if (!this.utility.compareDates(endDate, existingEntity.endDate)) {
      updatedEntity.endDate = endDate;
    }
    let value = entity.value;
    if (value !== existingEntity.value) {
      updatedEntity.value = value;
    }
    let startDate = entity.startDate;
    if (!this.utility.compareDates(startDate, existingEntity.startDate)) {
      updatedEntity.startDate = startDate;
    }
    if (isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.id = existingEntity.id;
    return updatedEntity;
  }

  private getValueHistoryItemsToSave(): {
    add: ValueHistoryItem[];
    delete: ValueHistoryItem[];
    update: ValueHistoryItem[];
  } {
    const toAdd: ValueHistoryItem[] = [],
      toUpdate: ValueHistoryItem[] = [];
    this.currentValueHistoryItems.forEach(entity => {
      if (!entity.id) {
        toAdd.push(entity);
        return;
      }
      let existingEntity = find(this.existingValueHistoryItems, {
          id: entity.id
        }),
        updatedEntity = this.getUpdatedValueHistoryItem(entity, existingEntity);
      if (updatedEntity) {
        toUpdate.push(updatedEntity);
      }
    });
    const toDelete = differenceBy(
      this.existingValueHistoryItems,
      this.currentValueHistoryItems,
      x => x.id
    );
    if (!toAdd.length && !toDelete.length && !toUpdate.length) {
      return null;
    }
    return {
      add: toAdd,
      delete: toDelete,
      update: toUpdate
    };
  }
}
