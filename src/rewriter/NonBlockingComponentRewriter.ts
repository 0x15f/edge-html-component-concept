export default class NonBlockingComponentRewriter {
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

  element(element: Element): void {
    element.setAttribute('component-id', this.component.id)
    this.componentResponses.push(this.component._deferredFunction(this.request))
  }
}
