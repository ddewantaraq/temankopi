/**
 * Creates a compact 3-class TF.js layers model for Teman Kopi.
 * Trains on synthetic leaf-like patterns so the on-device pipeline is real.
 * Retrain on BRACOL via colab_train_teman_kopi.ipynb / train.py for field accuracy.
 */
import * as tf from '@tensorflow/tfjs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(__dirname, '../public/models/teman-kopi')
const SIZE = 96
const LABELS = ['healthy', 'pest_like', 'disease_like']

function buildModel() {
  const model = tf.sequential()
  model.add(
    tf.layers.conv2d({
      inputShape: [SIZE, SIZE, 3],
      filters: 8,
      kernelSize: 3,
      strides: 2,
      activation: 'relu',
      kernelInitializer: 'heNormal',
    }),
  )
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }))
  model.add(
    tf.layers.conv2d({
      filters: 16,
      kernelSize: 3,
      strides: 2,
      activation: 'relu',
      kernelInitializer: 'heNormal',
    }),
  )
  model.add(tf.layers.flatten())
  model.add(tf.layers.dense({ units: 16, activation: 'relu' }))
  model.add(tf.layers.dense({ units: 3, activation: 'softmax' }))
  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  })
  return model
}

function makeBatch(batchSize = 24) {
  const buffer = new Float32Array(batchSize * SIZE * SIZE * 3)
  const ys = []
  for (let i = 0; i < batchSize; i++) {
    const label = i % 3
    const base = i * SIZE * SIZE * 3
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const idx = base + (y * SIZE + x) * 3
        const nx = x / SIZE
        const ny = y / SIZE
        const leaf = Math.hypot(nx - 0.5, ny - 0.5) < 0.4
        if (!leaf) {
          buffer[idx] = 0.95
          buffer[idx + 1] = 0.95
          buffer[idx + 2] = 0.95
          continue
        }
        if (label === 0) {
          buffer[idx] = 0.15
          buffer[idx + 1] = 0.7
          buffer[idx + 2] = 0.2
        } else if (label === 1) {
          const hole = ((x * 13 + y * 7) % 17) < 2
          buffer[idx] = hole ? 0.05 : 0.2
          buffer[idx + 1] = hole ? 0.05 : 0.55
          buffer[idx + 2] = hole ? 0.05 : 0.2
        } else {
          const mottled = (x + y) % 9 < 3
          buffer[idx] = mottled ? 0.75 : 0.35
          buffer[idx + 1] = mottled ? 0.5 : 0.45
          buffer[idx + 2] = 0.15
        }
      }
    }
    const yOh = [0, 0, 0]
    yOh[label] = 1
    ys.push(yOh)
  }
  return {
    xTensor: tf.tensor4d(buffer, [batchSize, SIZE, SIZE, 3]),
    yTensor: tf.tensor2d(ys),
  }
}

function fileHandler(dir) {
  return {
    save: async (modelArtifacts) => {
      fs.mkdirSync(dir, { recursive: true })
      const modelJson = {
        modelTopology: modelArtifacts.modelTopology,
        format: modelArtifacts.format,
        generatedBy: modelArtifacts.generatedBy ?? 'teman-kopi-bootstrap',
        convertedBy: null,
        weightsManifest: [
          {
            paths: ['weights.bin'],
            weights: modelArtifacts.weightSpecs,
          },
        ],
      }
      fs.writeFileSync(path.join(dir, 'model.json'), JSON.stringify(modelJson))
      const weightData = modelArtifacts.weightData
      const buffer = Buffer.from(
        weightData instanceof ArrayBuffer
          ? weightData
          : weightData.buffer,
      )
      fs.writeFileSync(path.join(dir, 'weights.bin'), buffer)
      return {
        modelArtifactsInfo: {
          dateSaved: new Date(),
          modelTopologyType: 'JSON',
        },
      }
    },
  }
}

async function main() {
  console.log('Building compact model…')
  const model = buildModel()
  model.summary()

  console.log('Training…')
  for (let epoch = 0; epoch < 6; epoch++) {
    const { xTensor, yTensor } = makeBatch(24)
    const history = await model.fit(xTensor, yTensor, {
      epochs: 1,
      batchSize: 8,
      verbose: 0,
    })
    const acc = history.history.acc ?? history.history.accuracy
    console.log(
      `epoch ${epoch + 1}: loss=${Number(history.history.loss?.[0]).toFixed(3)} acc=${Number(acc?.[0]).toFixed(3)}`,
    )
    xTensor.dispose()
    yTensor.dispose()
  }

  fs.mkdirSync(outDir, { recursive: true })
  await model.save(fileHandler(outDir))
  fs.writeFileSync(
    path.join(outDir, 'labels.json'),
    JSON.stringify(
      {
        labels: LABELS,
        inputSize: SIZE,
        note: 'Bootstrap CNN for offline demo. Retrain MobileNetV3Small on BRACOL via training/train.py or Colab notebook.',
      },
      null,
      2,
    ),
  )
  console.log('Saved TF.js model to', outDir)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
