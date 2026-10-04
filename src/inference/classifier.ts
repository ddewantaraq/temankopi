import * as tf from '@tensorflow/tfjs'
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm'
import wasmSimdPath from '@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm-simd.wasm?url'
import wasmPath from '@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm.wasm?url'
import wasmThreadedSimdPath from '@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm-threaded-simd.wasm?url'
import type { ScreeningLabel } from '../db/schema'
import { imageToTensor, setInputSize } from './preprocess'
import { checkImageQuality } from './quality'

export const CLASS_NAMES = ['healthy', 'pest_like', 'disease_like'] as const
export type ModelClass = (typeof CLASS_NAMES)[number]

const CONFIDENCE_THRESHOLD = 0.55
const TOP2_MARGIN = 0.1
const MODEL_URL = '/models/teman-kopi/model.json'

let modelPromise: Promise<tf.LayersModel> | null = null
let backendReady: Promise<void> | null = null

async function ensureBackend() {
  if (!backendReady) {
    backendReady = (async () => {
      setWasmPaths({
        'tfjs-backend-wasm.wasm': wasmPath,
        'tfjs-backend-wasm-simd.wasm': wasmSimdPath,
        'tfjs-backend-wasm-threaded-simd.wasm': wasmThreadedSimdPath,
      })
      try {
        await tf.setBackend('wasm')
        await tf.ready()
      } catch {
        await tf.setBackend('webgl')
        await tf.ready()
      }
    })()
  }
  return backendReady
}

export async function loadModel(): Promise<tf.LayersModel> {
  await ensureBackend()
  if (!modelPromise) {
    modelPromise = tf.loadLayersModel(MODEL_URL).then((model) => {
      const dim = model.inputs[0]?.shape?.[1]
      if (typeof dim === 'number' && dim > 0) setInputSize(dim)
      return model
    })
  }
  return modelPromise
}

export interface ClassificationResult {
  label: ScreeningLabel
  confidence: number
  scores: Record<ModelClass, number>
  qualityFail: boolean
  qualityReason?: string
}

function applyConfidenceGate(scores: number[]): {
  label: ScreeningLabel
  confidence: number
} {
  const indexed = scores.map((s, i) => ({ s, i })).sort((a, b) => b.s - a.s)
  const top = indexed[0]
  const second = indexed[1]
  const confidence = top.s

  if (confidence < CONFIDENCE_THRESHOLD || top.s - second.s < TOP2_MARGIN) {
    return { label: 'uncertain', confidence }
  }
  return { label: CLASS_NAMES[top.i], confidence }
}

export async function classifyImage(
  source: HTMLImageElement | HTMLCanvasElement,
): Promise<ClassificationResult> {
  const quality = await checkImageQuality(source)
  if (!quality.ok) {
    return {
      label: 'uncertain',
      confidence: 0,
      scores: { healthy: 0, pest_like: 0, disease_like: 0 },
      qualityFail: true,
      qualityReason: quality.reason,
    }
  }

  const model = await loadModel()
  const scores = tf.tidy(() => {
    const input = imageToTensor(source)
    const output = model.predict(input) as tf.Tensor
    return Array.from(output.dataSync() as Float32Array)
  })

  const scoreMap = {
    healthy: scores[0] ?? 0,
    pest_like: scores[1] ?? 0,
    disease_like: scores[2] ?? 0,
  }
  const gated = applyConfidenceGate([
    scoreMap.healthy,
    scoreMap.pest_like,
    scoreMap.disease_like,
  ])

  return {
    label: gated.label,
    confidence: gated.confidence,
    scores: scoreMap,
    qualityFail: false,
  }
}

export async function warmUpModel(): Promise<void> {
  try {
    await loadModel()
  } catch {
    // UI surfaces load errors on analyze.
  }
}
