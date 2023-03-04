import hash from '../utils/hash'

export default class DeferredComponentRewriter {
  protected request: Request

  protected component: Component

  protected componentResponses: Promise<Response>[]

  constructor(
    request: Request,
    component: Component,
    componentResponses: Promise<Response>[],
  ) {
    this.request = request
    this.component = component
    this.componentResponses = componentResponses
  }

  async element(element: Element): Promise<void> {
    element.setAttribute('component-id', this.component.id)
    this.componentResponses.push(this.component.function(this.request))
  }
}
