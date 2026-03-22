/**
 * Service Worker для LifeRPG
 * Обеспечивает работу приложения оффлайн
 */

const CACHE_NAME = 'liferpg-v1';
const ASSETS_TO_CACHE = [
    '/RPG-tracker/',
    '/RPG-tracker/index.html',
    '/RPG-tracker/style.css',
    '/RPG-tracker/app.js',
    '/RPG-tracker/manifest.json',
    '/RPG-tracker/icon-192.png',
    '/RPG-tracker/icon-512.png',
    '/RPG-tracker/storage/storage.js',
    '/RPG-tracker/components/card.js',
    '/RPG-tracker/components/deck.js',
    '/RPG-tracker/components/profile.js',
    '/RPG-tracker/ui/modal.js',
    '/RPG-tracker/ui/dashboard.js',
    '/RPG-tracker/ui/achievements.js'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Установка Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Кэширование файлов');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('[SW] Файлы закэшированы');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Ошибка кэширования:', error);
            })
    );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Активация Service Worker...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[SW] Удаление старого кэша:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker активирован');
                return self.clients.claim();
            })
    );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
    // Игнорируем не-GET запросы
    if (event.request.method !== 'GET') {
        return;
    }

    // Игнорируем внешние запросы
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Возвращаем из кэша
                    console.log('[SW] Из кэша:', event.request.url);
                    return cachedResponse;
                }

                // Загружаем из сети
                console.log('[SW] Из сети:', event.request.url);
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Проверяем валидность ответа
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Клонируем ответ для кэширования
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('[SW] Ошибка сети:', error);
                        // Возвращаем оффлайн страницу для навигации
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('[SW] Service Worker загружен');