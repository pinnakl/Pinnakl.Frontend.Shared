self.addEventListener('install', event => {
  console.log('installing sw v1.0.0');
});

self.addEventListener('activate', event => {
  console.log('activating sw v1.0.0');
});

// importScripts('https://www.gstatic.com/firebasejs/5.8.6/firebase-app.js');
// importScripts('https://www.gstatic.com/firebasejs/5.8.6/firebase-messaging.js');
importScripts('https://www.gstatic.com/firebasejs/7.17.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.17.1/firebase-messaging.js');

// Prod credentials - firebaseConfigs.prod
firebase.initializeApp({
  messagingSenderId: '477103941646',
  apiKey: 'AIzaSyCaNwNtlA8Tmwzmg6SbNb4jyQ7zce8-A-A',
  projectId: 'pinnakl-production',
  appId: '1:477103941646:web:1d103839f7e2bd238b745f'
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(({ data }) => {
  const { body, title } = data;
  return self.registration.showNotification(title, {
    body,
    data,
    icon: 'https://pinnakl.com/assets/pnkllogo8bit.png'
  });
});

self.addEventListener('notificationclick', ({ notification }) => {
  const { data } = notification;
  const { urlClick } = data;
  if (urlClick) {
    clients.openWindow(urlClick);
  }
});
