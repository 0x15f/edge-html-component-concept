import hash from '../utils/hash'

// This wrapper func handles generating an id for the component and proxying the resolution to support deferred components
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
        .then(async (text) => {
          return new Response(
            component.options?.deferred
              ? `<script>
          document.querySelector('[component-id="${id}"]').innerHTML =
            ${JSON.stringify(text)};
            const _self = document.currentScript;_self.parentNode.removeChild(_self)
        </script>`
              : text,
          )
        }),
  }
}
