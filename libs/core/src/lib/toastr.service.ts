import { Injectable } from '@angular/core';

import { ToastrService } from 'ngx-toastr';

@Injectable()
export class Toastr {
  constructor(private  readonly toastr: ToastrService) {}

  error(message: string, title?: string, options?: any): void {
    this.toastr.error(message, title, options);
  }

  info(message: string, title?: string, options?: any): void {
    this.toastr.info(message, title, options);
  }

  success(message: string, title?: string, options?: any): void {
    this.toastr.success(message, title, options);
  }

  warning(message: string, title?: string, options?: any): void {
    this.toastr.warning(message, title, options);
  }
}
