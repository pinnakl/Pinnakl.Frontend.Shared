import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { DialogsModule } from '@progress/kendo-angular-dialog';

import { SharedModule } from '../../shared.module';
import { SortValueHistoryItemsPipe } from './sort-value-history-items.pipe';
import { ValueHistoryItemFormComponent } from './value-history-item-form';
import { ValueHistoryManagerComponent } from './value-history-manager';
import { ValueHistoryManagerPopupComponent } from './value-history-manager-popup';
import { ValueHistoryManagerService } from './value-history-manager.service';
import { ValueHistoryTableComponent } from './value-history-table';

@NgModule({
  declarations: [
    SortValueHistoryItemsPipe,
    ValueHistoryItemFormComponent,
    ValueHistoryManagerComponent,
    ValueHistoryManagerPopupComponent,
    ValueHistoryTableComponent
  ],
  imports: [CommonModule, DialogsModule, ReactiveFormsModule, SharedModule],
  exports: [ValueHistoryManagerPopupComponent],
  providers: [ValueHistoryManagerService]
})
export class ValueHistoryManagerModule {}
