import ComponentRewiter from "./ComponentRewriter"

export default class BlockingComponentRewriter extends ComponentRewiter {
  async element(element: Element): Promise<void> {
    element.setAttribute('component-id', this.component.id)

    const response = await (this.component._promise ??
      this.component.function(this.request))
    const payload = await response.text()
    element.replace(payload, {
      html: true,
    })
    if (this.component.options?.template) element.removeAndKeepContent()
  }
}
