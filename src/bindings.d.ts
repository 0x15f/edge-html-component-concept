import { Method } from '@worker-tools/shed'

export {}

declare global {
  interface ComponentOptions {
    deferred?: boolean
    template?: boolean
  }

  interface PartialComponent {
    name: string
    route: {
      selector: string
      method: Method
    }
    html: {
      selector: string
    }
    options?: ComponentOptions
    function: (request: Request) => Promise<Response>
  }

  interface Component extends PartialComponent {
    id: string
  }
}
