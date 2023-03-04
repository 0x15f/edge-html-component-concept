import hash from '../utils/hash'

// This wrapper func handles generating an id for the component and proxying the resolution to support deferred components
export default async function componentWrapper(
  component: PartialComponent,
): Promise<Component> {
  const id = await hash(`component-${component.name}`)

  return {
    ...component,
    id,
    _promise: null,
    options: {
      // by default do not block
      blocking: component.options?.blocking ?? false,
      // by default do not remove the element used for mounting
      template: component.options?.template ?? true,
      // by default do not preload
      preload: component.options?.preload ?? false,
    },
  }
}
