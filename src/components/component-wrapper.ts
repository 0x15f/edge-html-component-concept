import hash from '../utils/hash'

export default async function componentWrapper(
  component: PartialComponent,
): Promise<Component> {
  const id = await hash(`component-${component.name}`)

  return {
    ...component,
    id,
    function: async (request) =>
      component
        .function(request)
        .then((response) => response.text())
        .then((text) => {
          return new Response(`<script>
      document.querySelector('[component-id="${id}"]').innerHTML =
        ${JSON.stringify(text)};
        const _self = document.currentScript;_self.parentNode.removeChild(_self)
    </script>`)
        }),
  }
}
