// Firebase Messaging Service Worker — background push + local reminder notifications
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAGXr2a9ep7xIuKE6-0l-uXN6k7UqAKoBo",
  authDomain: "aahanic-3cd4c.firebaseapp.com",
  projectId: "aahanic-3cd4c",
  storageBucket: "aahanic-3cd4c.firebasestorage.app",
  messagingSenderId: "711551256608",
  appId: "1:711551256608:web:811cffa239787f1af49445",
});

const messaging = firebase.messaging();

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// FCM background messages (when app is fully closed and server sends push)
messaging.onBackgroundMessage((payload) => {
  const { title = 'Aahanik', body = '' } = payload.notification || {};
  self.registration.showNotification(title, {
    body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: payload.data?.activityId || 'aahanik',
  });
});

// Local reminder notifications triggered from the page
// Using the service worker ensures the notification shows even when the page tab
// is hidden or the phone screen is off (PWA installed on home screen)
self.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'SHOW_NOTIFICATION') return;
  const { title, body, tag } = event.data;
  event.waitUntil(
    self.registration.showNotification(title || 'Aahanik — Daily Practice', {
      body: body || 'Time for your daily spiritual activity 🙏',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: tag || 'aahanik-reminder',
    })
  );
});
