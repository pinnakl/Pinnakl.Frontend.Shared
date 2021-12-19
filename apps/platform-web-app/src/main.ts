import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { fileUrl } from '@pnkl-frontend/shared';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

fileUrl.url = environment.fileServiceUrl;

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
