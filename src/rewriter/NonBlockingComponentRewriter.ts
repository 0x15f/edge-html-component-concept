import ComponentRewiter from "./ComponentRewriter"

export default class NonBlockingComponentRewriter extends ComponentRewiter {
  element(element: Element): void {
    element.setAttribute('component-id', this.component.id)

    this.streamedResponses.push(
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
