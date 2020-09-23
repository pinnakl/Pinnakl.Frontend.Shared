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

export const environment: Partial<PinnaklEnvironment> = {
  // defaultLoginCredentials: defaultLoginCredentials.local,
  // fileServiceUrl: fileServiceUrls.local,
  // frontEndErrorServiceUrl: frontEndErrorServiceUrls.local,
  // requestTimeoutPeriod: requestTimeoutPeriods.local,
  production: false,
  firebaseConfig: firebaseConfigs.prod,
  httpServiceUrl: httpServiceUrls.prod,
  serverUrl: serverUrls.prod,
  sseAppUrl: sseAppUrls.prod
};
