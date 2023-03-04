import handler from './handler'

addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(handler(event))
})
