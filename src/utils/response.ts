export default function createResponse(
  body: unknown,
  headers = {},
  code = 200,
): Response {
  const defaultHeaders = new Headers(headers)

  defaultHeaders.set('Content-Type', 'application/json')
  defaultHeaders.set('Access-Control-Allow-Origin', '*')
  defaultHeaders.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  defaultHeaders.set('Access-Control-Max-Age', '86400')
  defaultHeaders.set('Access-Control-Allow-Headers', '*')

  return new Response(JSON.stringify(body), {
    status: code,
    headers: defaultHeaders,
  })
}
