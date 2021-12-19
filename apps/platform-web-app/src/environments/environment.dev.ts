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
  defaultLoginCredentials: defaultLoginCredentials.staging,
  fileServiceUrl: fileServiceUrls.prod,
  firebaseConfig: firebaseConfigs.prod,
  frontEndErrorServiceUrl: frontEndErrorServiceUrls.staging,
  includeTesting: false,
  production: true,
  requestTimeoutPeriod: requestTimeoutPeriods.prod,
  httpServerUrl: httpServerUrls.staging,
  sseAppUrl: sseAppUrls.staging,
  sseBackupAppUrl: sseBackupAppUrls.staging,
  httpServiceUrl: httpServiceUrls.prod
};
