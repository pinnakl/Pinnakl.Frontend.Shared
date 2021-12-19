import {
  firebaseConfigs,
  httpServerUrls,
  httpServiceUrls,
  sseAppUrls,
  sseBackupAppUrls
} from './pinnakl-environment-options';
import { PinnaklEnvironment } from './pinnakl-environment.model';

export const environment: Partial<PinnaklEnvironment> = {
  // defaultLoginCredentials: defaultLoginCredentials.local,
  // fileServiceUrl: fileServiceUrls.local,
  // frontEndErrorServiceUrl: frontEndErrorServiceUrls.local,
  // requestTimeoutPeriod: requestTimeoutPeriods.local,
  production: false,
  firebaseConfig: firebaseConfigs.prod,
  httpServiceUrl: httpServiceUrls.prod,
  httpServerUrl: httpServerUrls.staging,
  sseAppUrl: sseAppUrls.prod,
  sseBackupAppUrl: sseBackupAppUrls.prod
};
