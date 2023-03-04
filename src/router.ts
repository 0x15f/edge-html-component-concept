import { Router, Method } from 'tiny-request-router'
import handler from './router/handler'

export async function route(
  event: FetchEvent,
  request: Request,
): Promise<Response> {
  const router = new Router()
  const url = new URL(request.url)

  router.get('/', handler)

  const match = router.match(<Method>request.method, url.pathname)
  if (match) {
    return match.handler({ params: match.params, request, event })
  } else {
    return fetch(request)
  }
}
