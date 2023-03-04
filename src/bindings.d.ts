import { Method } from '@worker-tools/shed'

export {}

declare global {
  interface PartialComponentOptions {
    blocking?: boolean
    template?: boolean
    preload?: boolean
  }

  interface ComponentOptions extends PartialComponentOptions {
    blocking: boolean
    template: boolean
    preload: boolean
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
    options?: PartialComponentOptions
    function: (request: Request) => Promise<Response>
  }

  interface Component extends PartialComponent {
    id: string
    _promise: Promise<Response> | null
    options: ComponentOptions
  }
}
