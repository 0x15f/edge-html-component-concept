import {
  BufferedStreamResponse,
  html,
  js,
  StreamResponse,
} from '@worker-tools/shed'
import ComponentRewriter from './rewriter/ComponentRewriter'

export async function route(request: Request): Promise<StreamResponse> {
  const rewriter = new HTMLRewriter()
  const url = new URL(request.url)

  const buffer = !url.searchParams.has('_buffer')
  const components: Component[] = []
  const chunks: Chunk[] = []

  const requestClone = request.clone()
  components.forEach((component) => {
    if (
      url.pathname.match(component.route.selector) &&
      request.method.match(component.route.method)
    )
      rewriter.on(
        component.html.selector,
        new ComponentRewriter(requestClone, component, chunks, buffer),
      )
  })

  async function* streamResponseWithComponents() {
    const selfDeleteTag =
      js`const _self = document.currentScript;_self.parentNode.removeChild(_self)`
    // awaited to prevent streaming of chunks prior to origin shell
    const response = await fetch(request)
    yield rewriter.transform(response).text()
    if (request.headers.has('cookie'))
      yield html`<script>document.cookie = ${JSON.stringify(
        request.headers.get('cookie'),
      )};${selfDeleteTag}</script>`

    // let each promise resolve
    for (const chunk of chunks)
      chunk.value.then(
        (val) =>
          yield html`<script>document.querySelector(${JSON.stringify(
            chunk.id,
          )}).innerHTML = ${JSON.stringify(val)};${selfDeleteTag}</script>`,
      )

    await Promise.all(chunks.map((chunk) => chunk.value))
    // anything else can be done now
  }

  return new (buffer ? BufferedStreamResponse : StreamResponse)(
    streamResponseWithComponents(),
    {
      headers: {
        'Content-Type': 'text/html',
      },
    },
  )
}
