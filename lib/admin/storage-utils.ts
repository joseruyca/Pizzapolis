export function parseSupabaseStoragePath(publicUrl: string) {
  try {
    const url = new URL(publicUrl)

    const marker = '/storage/v1/object/public/'
    const idx = url.pathname.indexOf(marker)

    if (idx === -1) return null

    const rest = url.pathname.slice(idx + marker.length)
    const firstSlash = rest.indexOf('/')

    if (firstSlash === -1) return null

    const bucket = rest.slice(0, firstSlash)
    const path = rest.slice(firstSlash + 1)

    if (!bucket || !path) return null

    return { bucket, path }
  } catch {
    return null
  }
}
