import { uuid } from "@cfworker/uuid"
import { html, StreamResponse } from "@worker-tools/shed"

export default async function handler({
  request,
}: RouteProps): Promise<Response> {
  const plugins = [
    {
      selector: '[example-fetch-data]',
      function: async (chunkId: string) => {
        return fetch('https://jsonplaceholder.typicode.com/posts')
          .then((response) => response.json())
          .then((json: any) => {
            return `<script>
              document.querySelector('[id="edge-chunk-${chunkId}"]').innerHTML = '<ul>${json.map((post: any) => `<li>${post.title}</li>`).join('')}</ul>';
            </script>`
          })
      }
    },
  ]

  const chunks: any[] = []

  // todo: "before" plugins
  // this is the main concept, parallel data fetching to origin payload download, the html thing less important

  class RunEdgePlugin {
    protected plugin: any

    constructor(plugin: any) {
      this.plugin = plugin
    }

    async element(element: Element) {
      html`<div></div>`
      const id = uuid()
      element.setAttribute('id', `edge-chunk-${id}`)
      chunks.push(this.plugin.function(id))
    }
  }

  const rewriter = new HTMLRewriter()
  plugins.forEach((plugin) =>
    rewriter.on(plugin.selector, new RunEdgePlugin(plugin)),
  )

  async function* streamResponseWithPlugins() {
    yield fetch(request).then(res => rewriter.transform(res).text())

    for (const chunk of chunks) {
      yield chunk
    }
  }

  return new StreamResponse(streamResponseWithPlugins(), {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
