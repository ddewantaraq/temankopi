import * as tf from '@tensorflow/tfjs'

/** Matches bootstrap model; BRACOL MobileNet export may use 224 — classifier reads model input shape. */
export let INPUT_SIZE = 96

export function setInputSize(size: number) {
  if (size > 0) INPUT_SIZE = size
}

/** RGB float in [0, 1], NHWC batch of 1. */
export function imageToTensor(
  source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
  size = INPUT_SIZE,
): tf.Tensor4D {
  return tf.tidy(() => {
    const t = tf.browser.fromPixels(source).toFloat()
    const resized = tf.image.resizeBilinear(t, [size, size])
    const normalized = resized.div(255)
    return normalized.expandDims(0) as tf.Tensor4D
  })
}
