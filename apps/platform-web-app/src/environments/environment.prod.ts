import {
  defaultLoginCredentials,
  fileServiceUrls,
  firebaseConfigs,
  frontEndErrorServiceUrls,
  httpServerUrls,
  httpServiceUrls,
  requestTimeoutPeriods,
  sseAppUrls,
  sseBackupAppUrls
} from './pinnakl-environment-options';
import { PinnaklEnvironment } from './pinnakl-environment.model';

export const environment: PinnaklEnvironment = {
  defaultLoginCredentials: defaultLoginCredentials.prod,
  fileServiceUrl: fileServiceUrls.prod,
  firebaseConfig: firebaseConfigs.prod,
  frontEndErrorServiceUrl: frontEndErrorServiceUrls.prod,
  includeTesting: false,
  production: true,
  requestTimeoutPeriod: requestTimeoutPeriods.prod,
  httpServerUrl: httpServerUrls.prod,
  sseAppUrl: sseAppUrls.prod,
  sseBackupAppUrl: sseBackupAppUrls.prod,
  httpServiceUrl: httpServiceUrls.prod
};
