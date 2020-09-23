import { InjectionToken } from '@angular/core';

export const PRODUCTION = new InjectionToken('production');
export const REQUEST_TIMEOUT_PERIOD = new InjectionToken(
  'requestTimeoutPeriod'
);
export const FRONT_END_ERROR_SERVICE_URL = new InjectionToken(
  'frontEndErrorServiceUrl'
);
export const FIREBASE_CONFIG = new InjectionToken('firebaseConfig');
