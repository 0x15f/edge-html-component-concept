import createResponse from '../utils/response'

export default async function unknown(): Promise<Response> {
  return createResponse('Endpoint Not Found', {}, 404)
}
