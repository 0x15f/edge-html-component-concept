import AbstractComponentRewiter from './AbstractComponentRewriter'

export default class NonBlockingComponentRewriter extends AbstractComponentRewiter {
  element(element: Element): void {
    super.element(element)

    // this does not seem very performant
    // todo: maybe i inject response as a "chunk" and then inject a script to move the chunk? that way i can use the html response as a stream, and I can write to it
    this.streamedResponses.push(
      (this.component._promise ?? this.component.function())
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
