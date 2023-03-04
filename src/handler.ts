import { html, HTMLResponse } from '@worker-tools/html'
import componentWrapper from './components/component-wrapper'
import BlockingComponentRewriter from './rewriter/BlockingComponentRewriter'
import NonBlockingComponentRewriter from './rewriter/NonBlockingComponentRewriter'

export default async function handler(event: FetchEvent): Promise<Response> {
  const { request } = event
  const rewriter = new HTMLRewriter()
  const url = new URL(request.url)

  const streamedResponses: Promise<Response>[] = [
    fetch(request).then((response) => rewriter.transform(response)),
  ]

  let timesToWait = 1
  let timesWaited = 0
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

  const requestClone = request.clone()
  for (const partialComponent of partialComponents) {
    const { method, selector } = partialComponent.route
    if (url.pathname.match(selector) && request.method.match(method)) {
      timesToWait++
      const component = await componentWrapper(partialComponent)
      if (component.options.preload)
        component._promise = component.function(requestClone)
      // preloading makes the component blocking
      const rewriterClass =
        component.options.blocking || component.options.preload
          ? BlockingComponentRewriter
          : NonBlockingComponentRewriter
      rewriter.on(
        component.html.selector,
        new rewriterClass(requestClone, component, streamedResponses),
      )
    }
  }

  const { readable, writable } = new TransformStream()

  const waitForPromisesAndWriteResponses = async () => {
    for (const promise of streamedResponses) {
      const response = await promise
      if (!response.body) continue
      await response.body.pipeTo(writable, {
        preventClose: timesToWait !== timesWaited,
      })
      timesWaited++
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
