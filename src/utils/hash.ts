export default async function (string: string): Promise<string> {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest('MD5', new TextEncoder().encode(string)),
    ),
  )
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
