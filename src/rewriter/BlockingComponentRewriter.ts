import AbstractComponentRewiter from './AbstractComponentRewriter'

export default class BlockingComponentRewriter extends AbstractComponentRewiter {
  async element(element: Element): Promise<void> {
    super.element(element)

    const response = await (this.component._promise ??
      this.component.function(this.request))
    const payload = await response.text()
    const elementFunc = this.component.options.template ? 'replace' : 'prepend'
    element[elementFunc](payload, {
      html: true,
    })
    if (this.component.options.template) element.removeAndKeepContent()
  }
}
