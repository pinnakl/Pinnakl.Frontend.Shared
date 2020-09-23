import { ErrorHandler, Injectable } from '@angular/core';

import { FrontendErrorService } from '../frontend-error';

@Injectable()
export class CustomErrorHandler implements ErrorHandler {
  constructor(private frontendErrorService: FrontendErrorService) {}
  handleError(error: any): void {
    this.frontendErrorService.handleError(error);
  }
}
