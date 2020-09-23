// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { environment as environmentDeveloperOverrides } from './environment.developer-overrides';
import {
  defaultLoginCredentials,
  fileServiceUrls,
  firebaseConfigs,
  frontEndErrorServiceUrls,
  httpServiceUrls,
  requestTimeoutPeriods,
  serverUrls,
  sseAppUrls
} from './pinnakl-environment-options';
import { PinnaklEnvironment } from './pinnakl-environment.model';

export const environment: PinnaklEnvironment = {
  defaultLoginCredentials: defaultLoginCredentials.prod,
  fileServiceUrl: fileServiceUrls.prod,
  firebaseConfig: firebaseConfigs.prod,
  frontEndErrorServiceUrl: frontEndErrorServiceUrls.prod,
  includeTesting: false,
  production: false,
  requestTimeoutPeriod: requestTimeoutPeriods.prod,
  serverUrl: serverUrls.prod,
  sseAppUrl: sseAppUrls.prod,
  httpServiceUrl: httpServiceUrls.prod,
  ...environmentDeveloperOverrides
};
