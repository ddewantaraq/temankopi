import * as tf from '@tensorflow/tfjs'

/** Default until model loads; DECAFIA MobileNetV3Small uses 224 — classifier reads input shape. */
export let INPUT_SIZE = 224

export function setInputSize(size: number) {
  if (size > 0) INPUT_SIZE = size
}

/**
 * RGB float in [-1, 1], NHWC batch of 1.
 * Matches training Rescaling(1/127.5, offset=-1) in training/train.py (outside the saved graph).
 */
export function imageToTensor(
  source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
  size = INPUT_SIZE,
): tf.Tensor4D {
  return tf.tidy(() => {
    const t = tf.browser.fromPixels(source).toFloat()
    const resized = tf.image.resizeBilinear(t, [size, size])
    const normalized = resized.div(127.5).sub(1)
    return normalized.expandDims(0) as tf.Tensor4D
  })
}
