import ComponentRewiter from './ComponentRewriter'

export default class NonBlockingComponentRewriter extends ComponentRewiter {
  element(element: Element): void {
    super.element(element)

    this.streamedResponses.push(
      (this.component._promise ?? this.component.function(this.request))
        .then((response) => response.text())
        .then(async (text) => {
          return new Response(`<script>
      const el = document.querySelector('[component-id="${
        this.component.id
      }"]');
      ${
        this.component.options.template
          ? `
      el.insertAdjacentHTML('beforeBegin', ${JSON.stringify(text)});
      el.remove();`
          : `el.innerHTML = ${JSON.stringify(text)}`
      }
      const _self = document.currentScript;_self.parentNode.removeChild(_self);
    </script>`)
        }),
    )
  }
}
