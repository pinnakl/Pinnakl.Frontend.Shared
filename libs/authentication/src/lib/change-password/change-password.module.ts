import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '@pnkl-frontend/shared';
import { ChangePasswordRoutingModule } from './change-password-routing.module';
import { ChangePasswordComponent } from './change-password.component';

@NgModule({
  declarations: [ChangePasswordComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ChangePasswordRoutingModule
  ],
  exports: [ChangePasswordComponent]
})
export class ChangePasswordModule {}
