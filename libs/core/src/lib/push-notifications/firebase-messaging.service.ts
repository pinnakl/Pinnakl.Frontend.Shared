import { Inject, Injectable } from '@angular/core';
import firebase from 'firebase/app';
import 'firebase/messaging';
import { FIREBASE_CONFIG } from '../environment.tokens';

interface FirebaseMessage {
  data: {
    body: string;
    title: string;
    urlBlock: string;
  };
}

@Injectable()
export class FirebaseMessagingService {
  private messaging: firebase.messaging.Messaging;

  constructor(@Inject(FIREBASE_CONFIG) private readonly firebaseConfig: any) {
    firebase.initializeApp(this.firebaseConfig);
  }

  async initialize(): Promise<void> {
    firebase.initializeApp(this.firebaseConfig);
    this.messaging = firebase.messaging();
    try {
      const firebaseServiceWorkerRegistration = await navigator.serviceWorker.register(
        'firebase-messaging-sw-custom.js'
      );
      console.log(firebaseServiceWorkerRegistration);
      this.messaging.useServiceWorker(firebaseServiceWorkerRegistration);
      await this.messaging.requestPermission();
      this.messaging.onMessage(this.handlePushNotificationInForeground);
    } catch (e) {
      console.error('FirebaseMessage error:', e);
    }
  }

  async getFCMWebSetting(): Promise<string> {
    try {
      if (!this.messaging) {
        await this.initialize();
      }
      const token = await this.messaging.getToken();
      return JSON.stringify({ fcmUserToken: token });
    } catch (e) {
      console.error('FirebaseMessage error:', e);
    }
  }

  private async handlePushNotificationInForeground({
    data
  }: FirebaseMessage): Promise<void> {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const firebaseServiceWorkerRegistration = registrations.find(r =>
      r.active.scriptURL.includes('firebase-messaging-sw-custom.js')
    );
    if (!firebaseServiceWorkerRegistration) {
      return;
    }
    const { body, title, urlBlock } = data;
    if (location.hash.includes(urlBlock)) {
      return;
    }
    return firebaseServiceWorkerRegistration.showNotification(title, {
      body,
      data,
      icon: 'https://pinnakl.com/assets/pnkllogo8bit.png'
    });
  }
}
