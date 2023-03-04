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

    this.componentResponses.push(
      (this.component._promise ?? this.component.function(this.request))
        .then((response) => response.text())
        .then(async (text) => {
          return new Response(`<script>
      document.querySelector('[component-id="${
        this.component.id
      }"]').innerHTML =
        ${JSON.stringify(text)};
        const _self = document.currentScript;_self.parentNode.removeChild(_self)
    </script>`)
        }),
    )
  }
}
