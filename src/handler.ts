import { html, HTMLResponse } from '@worker-tools/html'
import componentWrapper from './components/component-wrapper'
import BlockingComponentRewriter from './rewriter/BlockingComponentRewriter'
import NonBlockingComponentRewriter from './rewriter/NonBlockingComponentRewriter'

export default async function handler(event: FetchEvent): Promise<Response> {
  const { request } = event
  const rewriter = new HTMLRewriter()
  const url = new URL(request.url)

  const ignoreRoutes = ['/cart.js', '/cart/update.js']
  if (ignoreRoutes.includes(url.pathname)) return fetch(request)

  const streamedResponses: Promise<Response>[] = [
    fetch(request).then((response) => rewriter.transform(response)),
  ]

  const streamConfig = {
    totalStreams: 1,
    streamsSent: 0,
  }
  const partialComponents: PartialComponent[] = [
    {
      name: 'test',
      route: {
        method: 'GET',
        selector: '/',
      },
      html: {
        selector: '[example-fetch-data]',
      },
      options: {
        // preload: true,
        blocking: true,
      },
      function: async () => {
        const postsPromise = fetch(
          'https://jsonplaceholder.typicode.com/posts/1',
        ).then((r) => r.text())

        return new HTMLResponse(html`
          <h1>This was fetched and injected via the edge!</h1>
          <p>Post data: ${postsPromise}.</p>
        `)
      },
    },
  ]

  for (const partialComponent of partialComponents) {
    const { method, selector } = partialComponent.route
    if (url.pathname.match(selector) && request.method.match(method)) {
      streamConfig.totalStreams++
      const component = await componentWrapper(partialComponent)
      if (component.options.preload)
        component._promise = component.function()
      // preloading makes the component blocking
      const rewriterClass =
        component.options.blocking || component.options.preload
          ? BlockingComponentRewriter
          : NonBlockingComponentRewriter
      rewriter.on(
        component.html.selector,
        new rewriterClass(component, streamedResponses),
      )
    }
  }

  const { readable, writable } = new TransformStream()

  const waitForPromisesAndWriteResponses = async () => {
    for (const promise of streamedResponses) {
      const response = await promise
      if (!response.body) continue
      await response.body.pipeTo(writable, {
        preventClose: streamConfig.totalStreams !== streamConfig.streamsSent,
      })
      streamConfig.streamsSent++
    }
    await writable.close()
  }

  waitForPromisesAndWriteResponses()

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
