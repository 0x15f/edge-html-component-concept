import { Router, Method } from 'tiny-request-router'

// routes
import unknown from './routes/unknown'
import options from './routes/options'

export async function route(
  event: FetchEvent,
  request: Request,
): Promise<Response> {
  const router = new Router()
  const url = new URL(request.url)

  /**
   * Empty options required for pre-flight requests
   * CORS fails if this is not here
   */
  router.options('*', options)

  const match = router.match(<Method>request.method, url.pathname)
  if (match) {
    return match.handler({ params: match.params, request, event })
  } else {
    return unknown()
  }
}
