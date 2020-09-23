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
// Staging credentials - firebaseConfigs.staging
firebase.initializeApp({
  messagingSenderId: '920036889346',
  apiKey: "AIzaSyDd3c-4d3UHAWbHGPangyHlRPWEs9ZLNCg",
  projectId: "pinnakl-staging",
  appId: "1:920036889346:web:902816d3ffe7dcddbfe81b"
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
