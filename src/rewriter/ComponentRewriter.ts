import hash from '../utils/hash'

export default class ComponentRewriter {
  protected request: Request

  protected component: Component

  protected chunks: Chunk[]

  constructor(request: Request, component: Component, chunks: Chunk[]) {
    this.request = request;
    this.component = component
    this.chunks = chunks
  }

  async element(element: Element): Promise<void> {
    const id = await hash(`component-${this.component.name}`)
    element.setAttribute('id', id)
    this.chunks.push({
      id,
      name: this.component.name,
      value: this.component.function(this.request),
    })
  }
}
