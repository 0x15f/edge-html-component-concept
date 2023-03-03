import createResponse from '../utils/response'

export default async function options(): Promise<Response> {
  return createResponse(null)
}
