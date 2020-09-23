import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DialogModule } from '@progress/kendo-angular-dialog';
import { PinnaklModalComponent } from './pinnakl-modal.component';

@NgModule({
  imports: [CommonModule, DialogModule],
  declarations: [PinnaklModalComponent],
  exports: [PinnaklModalComponent],
  providers: []
})
export class PinnaklModalModule {}
