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
      blocking: component.options?.blocking ?? false,
      template: component.options?.blocking ?? false,
      preload: component.options?.blocking ?? false,
    },
  }
}
