import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { PinnaklWebSocketService } from '@pnkl-frontend/core';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { fileUrl } from '@pnkl-frontend/shared';

if (environment.production) {
  enableProdMode();
}

const pinnaklWebSocketService = new PinnaklWebSocketService();
pinnaklWebSocketService.setServerURL(environment.serverUrl);
fileUrl.url = environment.fileServiceUrl;

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
