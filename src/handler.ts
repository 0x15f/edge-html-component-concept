import componentWrapper from './components/component-wrapper'
import ComponentRewriter from './rewriter/ComponentRewriter'

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
      name: 'Jake Test',
      route: {
        method: 'GET',
        selector: '/',
      },
      html: {
        selector: '[example-fetch-data]',
      },
      function: async () => {
        return new Response(
          'This is jakes test data to insert into this component via the server',
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
        new ComponentRewriter(
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
