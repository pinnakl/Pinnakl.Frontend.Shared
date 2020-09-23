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
  production: true,
  requestTimeoutPeriod: requestTimeoutPeriods.prod,
  serverUrl: serverUrls.prod,
  sseAppUrl: sseAppUrls.prod,
  httpServiceUrl: httpServiceUrls.prod
};
