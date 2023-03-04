import { StreamResponse } from '@worker-tools/shed'
import ComponentRewriter from './rewriter/ComponentRewriter'

export async function route(request: Request): Promise<Response> {
  const rewriter = new HTMLRewriter()
  const url = new URL(request.url)

  const components: Component[] = []
  const chunks: Chunk[] = []

  components.forEach((component) => {
    if (url.pathname.match(component.route.selector))
      rewriter.on(
        component.html.selector,
        new ComponentRewriter(component, chunks),
      )
  })

  async function* streamResponseWithComponents() {
    yield fetch(request).then((res) =>
      rewriter
        .transform(res)
        .text()
        .then((body) => body.replace('</html>', '')),
    )
    for (const chunk of chunks)
      yield `<script>document.querySelector('${
        chunk.id
      }').innerHTML = ${chunk.value.then((val) =>
        JSON.stringify(val),
      )}</script>`
    yield '</html>'
  }

  return new StreamResponse(streamResponseWithComponents(), {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
