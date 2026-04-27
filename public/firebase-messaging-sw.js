// Firebase Messaging Service Worker — background push notification handler
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

messaging.onBackgroundMessage((payload) => {
  const { title = 'Aahanik', body = '' } = payload.notification || {};
  self.registration.showNotification(title, {
    body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: payload.data?.activityId || 'aahanik',
    requireInteraction: false,
  });
});
