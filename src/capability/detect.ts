export function hasWebGL(doc: Document = document): boolean {
  try {
    const canvas = doc.createElement('canvas')
    const ctx = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null
    if (!ctx) return false
    try {
      ctx.getExtension?.('WEBGL_lose_context')?.loseContext()
    } catch {
      // releasing is best-effort
    }
    return true
  } catch {
    return false
  }
}
