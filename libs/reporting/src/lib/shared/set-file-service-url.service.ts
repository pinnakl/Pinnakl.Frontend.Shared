import { Injectable, Inject } from '@angular/core';

import { setFileServiceURL } from '@pnkl-frontend/shared';
import { FILE_SERVICE_URL_REPORTING } from '../enviroment.tokens';

@Injectable()
export class SetFileServiceUrl {
  constructor(
    @Inject(FILE_SERVICE_URL_REPORTING) private reportingUrl: string
  ) {
    setFileServiceURL(this.reportingUrl);
  }
}
