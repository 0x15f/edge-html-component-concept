export {}

/**
 * Declare kv namespaces here so using them does not throw type errors
 */
declare global {
  // below is an example kv namespace binding
  // const MY_NAMESPACE: KVNamespace

  interface Component {
    name: string
    route: {
      selector: string
    }
    html: {
      selector: string
    }
    function: (request: Request) => Promise<string>
  }

  interface Chunk {
    id: string
    name: string
    value: Promise<string>
  }
}
