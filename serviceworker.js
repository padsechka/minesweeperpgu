// Устанавливаем имена для кэшей
const CACHE_NAME = 'tic-tac-toe-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  'https://raw.githubusercontent.com/google/material-design-icons/master/png/av/play_arrow/materialicons/192dp/1x/baseline_play_arrow_black_192dp.png',
  'https://raw.githubusercontent.com/google/material-design-icons/master/png/av/play_arrow/materialicons/512dp/1x/baseline_play_arrow_black_512dp.png'
];

// Устанавливаем обработчик события 'install' для service worker
self.addEventListener('install', (event) => {
  // Открываем кэш и добавляем ресурсы в него
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Открыт кэш');
        return cache.addAll(urlsToCache);
      })
  );
});

// Устанавливаем обработчик события 'fetch' для перехвата запросов
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Возвращаем ресурс из кэша, если он там есть
        if (response) {
          return response;
        }
        // Если ресурса нет в кэше, запрашиваем его из сети
        return fetch(event.request);
      }
    )
  );
});

// Устанавливаем обработчик события 'activate' для обновления service worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
