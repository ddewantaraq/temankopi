import * as tf from '@tensorflow/tfjs'

/** Default until model loads; DECAFIA MobileNetV3Small export uses 224 — classifier reads input shape. */
export let INPUT_SIZE = 224

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
