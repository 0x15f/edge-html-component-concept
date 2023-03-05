export default abstract class AbstractComponentRewiter {

  protected component: Component

  protected streamedResponses: Promise<Response>[]

  constructor(
    component: Component,
    streamedResponses: Promise<Response>[],
  ) {
    this.component = component
    this.streamedResponses = streamedResponses
  }

  element(element: Element): void {
    element.setAttribute('component-id', this.component.id)
  }
}
