import { html, HTMLResponse } from '@worker-tools/html'
import componentWrapper from './components/component-wrapper'
import AsyncComponentRewriter from './rewriter/AsyncComponentRewriter'
import DeferredComponentRewriter from './rewriter/DeferredComponentRewriter'

export default async function handler(event: FetchEvent): Promise<Response> {
  const { request } = event
  const rewriter = new HTMLRewriter()
  const url = new URL(request.url)

  const responses: Promise<Response>[] = [
    fetch(request).then((response) => rewriter.transform(response)),
  ]

  let timesToWait = 1
  let timesWaited = 0
  const components: PartialComponent[] = [
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
        deferred: true,
      },
      function: async () => {
        return new HTMLResponse(
          html`<p>This is a test to insert this component into the page via the
          server</p>`,
        )
      },
    },
  ]
  for (const component of components) {
    const { method, selector } = component.route
    if (url.pathname.match(selector) && request.method.match(method)) {
      timesToWait++
      rewriter.on(
        component.html.selector,
        new (component.options?.deferred
          ? DeferredComponentRewriter
          : AsyncComponentRewriter)(
          request.clone(),
          await componentWrapper(component),
          responses,
        ),
      )
    }
  }

  const { readable, writable } = new TransformStream()

  const concat = async () => {
    for (const promise of responses) {
      const response = await promise
      if (!response.body) continue
      await response.body.pipeTo(writable, {
        preventClose: timesToWait !== timesWaited,
      })
      timesWaited++
    }
    await writable.close()
  }

  concat()

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
