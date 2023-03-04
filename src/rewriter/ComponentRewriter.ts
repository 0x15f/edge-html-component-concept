import hash from '../utils/hash'

export default class ComponentRewriter {
  protected component: Component

  protected chunks: Chunk[]

  constructor(component: Component, chunks: Chunk[]) {
    this.component = component
    this.chunks = chunks
  }

  async element(element: Element): Promise<void> {
    const id = await hash(`component-${this.component.name}`)
    element.setAttribute('id', id)
    this.chunks.push({
      id,
      value: this.component.function(),
    })
  }
}
