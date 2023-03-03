import { route } from './router'

addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(route(event, event.request))
})
