export type QualityResult =
  | { ok: true }
  | { ok: false; reason: 'too_dark' | 'too_bright' | 'too_blurry' | 'low_variance' }

/**
 * Lightweight client-side image quality gate before model inference.
 * Fail-safe: refuse to guess when the photo is unlikely to be reliable.
 */
export async function checkImageQuality(
  source: HTMLImageElement | HTMLCanvasElement,
): Promise<QualityResult> {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return { ok: false, reason: 'low_variance' }

  ctx.drawImage(source, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)

  let sum = 0
  let sumSq = 0
  let edge = 0
  const gray = new Float32Array(size * size)

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    gray[p] = g
    sum += g
    sumSq += g * g
  }

  const n = gray.length
  const mean = sum / n
  const variance = sumSq / n - mean * mean

  if (mean < 35) return { ok: false, reason: 'too_dark' }
  if (mean > 245) return { ok: false, reason: 'too_bright' }
  if (variance < 80) return { ok: false, reason: 'low_variance' }

  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const i = y * size + x
      const dx = Math.abs(gray[i] - gray[i + 1])
      const dy = Math.abs(gray[i] - gray[i + size])
      edge += dx + dy
    }
  }
  const edgeMean = edge / ((size - 1) * (size - 1) * 2)
  if (edgeMean < 4.5) return { ok: false, reason: 'too_blurry' }

  return { ok: true }
}
