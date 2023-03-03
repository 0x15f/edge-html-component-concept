export {}

/**
 * Declare kv namespaces here so using them does not throw type errors
 */
declare global {
  // below is an example kv namespace binding
  // const MY_NAMESPACE: KVNamespace

  interface RouteProps {
    params: Params
    request: Request
    event: FetchEvent
  }
}
