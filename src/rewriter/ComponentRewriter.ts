export default abstract class ComponentRewiter {
  protected request: Request

  protected component: Component

  protected streamedResponses: Promise<Response>[]

  constructor(
    request: Request,
    component: Component,
    streamedResponses: Promise<Response>[],
  ) {
    this.request = request
    this.component = component
    this.streamedResponses = streamedResponses
  }
}