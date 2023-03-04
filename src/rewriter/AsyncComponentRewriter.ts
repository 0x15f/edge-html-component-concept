import hash from '../utils/hash'

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
    const id = await hash(`component-${this.component.name}`)
    element.setAttribute('component-id', id)

    const response = await this.component.function(this.request)
    const payload = await response.text()
    element.replace(payload, {
      html: true,
    })
    if (this.component.options?.template) element.removeAndKeepContent()
  }
}
