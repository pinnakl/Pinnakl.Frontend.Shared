const crmAppUrls = {
  local: 'http://localhost:60524/',
  prod: 'https://backendMiscService.pinnakl.com/',
  staging: 'https://crmappstage.azurewebsites.net/'
};

// const x = Object.keys(crmAppUrls)
//   .map(type => ({ [type]: `${crmAppUrls[type]}File/` }))
//   .reduce((result, typeWithUrl) => ({ ...result, ...typeWithUrl }), {});

export const defaultLoginCredentials = {
  local: {
    password: 'password',
    username: 'mtambellini@stamincapital.com'
  },
  prod: {
    password: '',
    username: ''
  },
  staging: {
    password: 'password',
    username: 'jon@nonempty.net'
  }
};

export const fileServiceUrls = {
  local: 'http://localhost:60524/File/',
  prod: 'https://backendMiscService.pinnakl.com/File/',
  staging: 'https://crmappstage.azurewebsites.net/File/'
};

export const firebaseConfigs = {
  prod: {
    messagingSenderId: '477103941646',
    apiKey: 'AIzaSyCaNwNtlA8Tmwzmg6SbNb4jyQ7zce8-A-A',
    projectId: 'pinnakl-production',
    appId: '1:477103941646:web:1d103839f7e2bd238b745f'
  },
  staging: {
    messagingSenderId: '920036889346',
    apiKey: 'AIzaSyDd3c-4d3UHAWbHGPangyHlRPWEs9ZLNCg',
    projectId: 'pinnakl-staging',
    appId: '1:920036889346:web:902816d3ffe7dcddbfe81b'
  }
};

const FRONT_END_ERROR = 'FrontEndError/Post';

export const frontEndErrorServiceUrls = {
  local: `${crmAppUrls.local}${FRONT_END_ERROR}`,
  prod: `${crmAppUrls.prod}${FRONT_END_ERROR}`,
  staging: `${crmAppUrls.staging}${FRONT_END_ERROR}`
};

export const requestTimeoutPeriods = {
  local: 3000000,
  staging: 300000,
  prod: 30000
};

export const serverUrls = {
  local: 'ws://localhost:45612',
  prod: 'wss://servergateway.pinnakl.com:45611',
  // staging: 'ws://stagingserver.pinnakl.com:45612'
  staging: 'ws://indiastagevm.westindia.cloudapp.azure.com:45612'
};

export const sseAppUrls = {
  local: 'https://localhost:44393/api/',
  prod: 'https://sse.pinnakl.com/api/',
  staging: 'http://stagingserver.pinnakl.com/PnklSSE/api/'
};

export const httpServiceUrls = {
  local: 'https://localhost:44323/api/',
  prod: 'https://services.pinnakl.com/api/'
};
// prod1: 'https://servergateway.pinnakl.com/PnklSSE/api/'
// prod2: 'http://pinnakl.cloudpap.net/PnklSSE/api/'
