#!/usr/bin/env python3
"""Train MobileNetV3Small (3-class) on BRACOL-remapped folders and save Keras model.

Expected layout after prepare_bracol.py / manual remap:

  training/data/bracol_remapped/
    train/{healthy,pest_like,disease_like}/*.jpg
    val/{healthy,pest_like,disease_like}/*.jpg

Download BRACOL from:
  https://data.mendeley.com/datasets/yy2k5y8mxg/1
"""

from __future__ import annotations

import argparse
from pathlib import Path

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV3Small

CLASS_NAMES = ["healthy", "pest_like", "disease_like"]
IMG_SIZE = (224, 224)
AUTOTUNE = tf.data.AUTOTUNE


def build_datasets(data_dir: Path, batch_size: int):
    train_ds = keras.utils.image_dataset_from_directory(
        data_dir / "train",
        labels="inferred",
        class_names=CLASS_NAMES,
        image_size=IMG_SIZE,
        batch_size=batch_size,
        shuffle=True,
    )
    val_ds = keras.utils.image_dataset_from_directory(
        data_dir / "val",
        labels="inferred",
        class_names=CLASS_NAMES,
        image_size=IMG_SIZE,
        batch_size=batch_size,
        shuffle=False,
    )
    normalization = layers.Rescaling(1.0 / 127.5, offset=-1)
    train_ds = train_ds.map(lambda x, y: (normalization(x), y), num_parallel_calls=AUTOTUNE)
    val_ds = val_ds.map(lambda x, y: (normalization(x), y), num_parallel_calls=AUTOTUNE)
    return train_ds.prefetch(AUTOTUNE), val_ds.prefetch(AUTOTUNE)


def build_model(num_classes: int = 3) -> keras.Model:
    base = MobileNetV3Small(
        input_shape=IMG_SIZE + (3,),
        include_top=False,
        weights="imagenet",
        pooling="avg",
        include_preprocessing=False,
    )
    base.trainable = False
    inputs = keras.Input(shape=IMG_SIZE + (3,))
    x = base(inputs, training=False)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)
    model = keras.Model(inputs, outputs, name="teman_kopi_mobilenetv3small")
    model.compile(
        optimizer=keras.optimizers.Adam(1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=Path(__file__).parent / "data" / "bracol_remapped",
    )
    parser.add_argument("--epochs", type=int, default=8)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).parent / "artifacts" / "teman_kopi_keras.keras",
    )
    args = parser.parse_args()

    train_ds, val_ds = build_datasets(args.data_dir, args.batch_size)
    model = build_model()
    model.fit(train_ds, validation_data=val_ds, epochs=args.epochs)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    model.save(args.out)
    print(f"Saved Keras model to {args.out}")


if __name__ == "__main__":
    main()
