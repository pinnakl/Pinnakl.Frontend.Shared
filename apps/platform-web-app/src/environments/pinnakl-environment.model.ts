export interface PinnaklEnvironment {
  defaultLoginCredentials: {
    password: string;
    username: string;
  };
  fileServiceUrl: string;
  firebaseConfig: {
    messagingSenderId: string;
    apiKey?: string;
    projectId?: string;
    appId?: string;
  };
  frontEndErrorServiceUrl: string;
  includeTesting: boolean;
  production: boolean;
  requestTimeoutPeriod: number;
  serverUrl: string;
  sseAppUrl: string;
  httpServiceUrl: string;
}
