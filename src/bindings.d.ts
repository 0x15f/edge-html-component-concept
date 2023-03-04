import { Method } from '@worker-tools/shed'

export {}

/**
 * Declare kv namespaces here so using them does not throw type errors
 */
declare global {
  interface PartialComponent {
    name: string
    route: {
      selector: string
      method: Method
    }
    html: {
      selector: string
    }
    function: (request: Request) => Promise<Response>
  }

  interface Component extends PartialComponent {
    id: string
  }
}
