/**
 * Build and export a real TF.js 3-class leaf screening model for Teman Kopi.
 *
 * Compact CNN, 224×224 → 3-way softmax, trained on procedural leaf-like patterns
 * so the PWA ships a working on-device model. Retrain on BRACOL via
 * training/train.py + training/export_tfjs.py for production-quality weights.
 */
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as tf from '@tensorflow/tfjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(__dirname, '../public/models/teman-kopi')
const IMG = 224
const CLASSES = 3
const SAMPLES_PER_CLASS = 80
const EPOCHS = 5
const BATCH = 8

function buildModel() {
  const model = tf.sequential()
  model.add(
    tf.layers.conv2d({
      inputShape: [IMG, IMG, 3],
      filters: 16,
      kernelSize: 3,
      strides: 2,
      activation: 'relu',
      padding: 'same',
    }),
  )
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }))
  model.add(
    tf.layers.conv2d({
      filters: 32,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same',
    }),
  )
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }))
  model.add(
    tf.layers.conv2d({
      filters: 64,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same',
    }),
  )
  model.add(tf.layers.globalAveragePooling2d({ dataFormat: 'channelsLast' }))
  model.add(tf.layers.dropout({ rate: 0.25 }))
  model.add(tf.layers.dense({ units: 32, activation: 'relu' }))
  model.add(tf.layers.dense({ units: CLASSES, activation: 'softmax' }))
  model.compile({
    optimizer: tf.train.adam(1e-3),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  })
  return model
}

function fillSample(data, offset, classIndex) {
  for (let y = 0; y < IMG; y++) {
    for (let x = 0; x < IMG; x++) {
      const i = offset + (y * IMG + x) * 3
      const cx = x / IMG - 0.5
      const cy = y / IMG - 0.5
      const r = Math.sqrt(cx * cx + cy * cy)
      const angle = Math.atan2(cy, cx)
      let R = 0.15 + 0.05 * Math.sin(angle * 3)
      let G = 0.45 + 0.15 * Math.cos(r * 12)
      let B = 0.12 + 0.04 * Math.sin(r * 8)

      if (classIndex === 1) {
        const holes = Math.sin(x * 0.35) * Math.cos(y * 0.28)
        if (holes > 0.55 || (Math.sin(x * 0.9 + y * 0.4) > 0.85 && r < 0.42)) {
          R = 0.05
          G = 0.08
          B = 0.05
        }
      } else if (classIndex === 2) {
        const spot = Math.sin(x * 0.2) * Math.sin(y * 0.22)
        if (spot > 0.35 && r < 0.45) {
          R = 0.55 + 0.2 * spot
          G = 0.25
          B = 0.08
        }
      } else {
        G += 0.08 * Math.cos(angle * 2)
      }

      const n = (Math.random() - 0.5) * 0.06
      R = Math.min(1, Math.max(0, R + n))
      G = Math.min(1, Math.max(0, G + n))
      B = Math.min(1, Math.max(0, B + n))
      data[i] = R * 2 - 1
      data[i + 1] = G * 2 - 1
      data[i + 2] = B * 2 - 1
    }
  }
}

function makeDataset() {
  const total = CLASSES * SAMPLES_PER_CLASS
  const data = new Float32Array(total * IMG * IMG * 3)
  const labels = new Int32Array(total)
  let n = 0
  for (let c = 0; c < CLASSES; c++) {
    for (let s = 0; s < SAMPLES_PER_CLASS; s++) {
      fillSample(data, n * IMG * IMG * 3, c)
      labels[n] = c
      n++
    }
  }
  const x = tf.tensor4d(data, [total, IMG, IMG, 3])
  const y = tf.oneHot(tf.tensor1d(labels, 'int32'), CLASSES)
  return { x, y }
}

async function saveModel(model) {
  await fs.mkdir(OUT_DIR, { recursive: true })
  for (const file of await fs.readdir(OUT_DIR)) {
    await fs.unlink(path.join(OUT_DIR, file))
  }

  await model.save(
    tf.io.withSaveHandler(async (artifacts) => {
      const modelJson = {
        modelTopology: artifacts.modelTopology,
        format: artifacts.format,
        generatedBy: artifacts.generatedBy,
        convertedBy: artifacts.convertedBy ?? null,
        weightsManifest: [
          {
            paths: ['weights.bin'],
            weights: artifacts.weightSpecs,
          },
        ],
      }
      await fs.writeFile(path.join(OUT_DIR, 'model.json'), JSON.stringify(modelJson))
      const weightData = artifacts.weightData
      const buffer = Buffer.from(
        weightData instanceof ArrayBuffer
          ? weightData
          : weightData.buffer,
        weightData instanceof ArrayBuffer ? 0 : weightData.byteOffset,
        weightData instanceof ArrayBuffer ? weightData.byteLength : weightData.byteLength,
      )
      await fs.writeFile(path.join(OUT_DIR, 'weights.bin'), buffer)
      return {
        modelArtifactsInfo: {
          dateSaved: new Date(),
          modelTopologyType: 'JSON',
        },
      }
    }),
  )
}

async function main() {
  await tf.setBackend('cpu')
  await tf.ready()
  console.log('Backend:', tf.getBackend())
  const model = buildModel()
  model.summary()
  const { x, y } = makeDataset()
  console.log('Training compact CNN…')
  await model.fit(x, y, {
    epochs: EPOCHS,
    batchSize: BATCH,
    shuffle: true,
    validationSplit: 0.15,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(
          `epoch ${epoch + 1}: loss=${logs.loss.toFixed(4)} acc=${(logs.acc ?? 0).toFixed(3)} val_acc=${(logs.val_acc ?? 0).toFixed(3)}`,
        )
      },
    },
  })
  x.dispose()
  y.dispose()
  await saveModel(model)
  console.log('Wrote TF.js model to', OUT_DIR)
  model.dispose()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
