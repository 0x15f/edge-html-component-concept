import hash from '../utils/hash'

export default class ComponentRewriter {
  protected request: Request

  protected component: Component

  protected chunks: Chunk[]

  protected buffer: boolean

  constructor(request: Request, component: Component, chunks: Chunk[], buffer: boolean) {
    this.request = request;
    this.component = component
    this.chunks = chunks
    this.buffer = buffer
  }

  async element(element: Element): Promise<void> {
    const id = await hash(`component-${this.component.name}`)
    element.setAttribute('id', id)
    if (this.buffer) this.chunks.push({
      id,
      name: this.component.name,
      value: this.component.function(this.request),
    });
    else {
      const payload = await this.component.function(this.request)
      element.prepend(payload)
    }
  }
}
