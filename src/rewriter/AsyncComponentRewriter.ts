export default class AsyncComponentRewriter {
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

    const response = await this.component.function(this.request)
    const payload = await response.text()
    element.replace(payload, {
      html: true,
    })
    if (this.component.options?.template) element.removeAndKeepContent()
  }
}
