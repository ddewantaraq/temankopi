#!/usr/bin/env python3
"""Evaluate a trained Keras Teman Kopi model on a remapped folder split."""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import tensorflow as tf
from tensorflow import keras
from sklearn.metrics import classification_report, confusion_matrix

CLASS_NAMES = ["healthy", "pest_like", "disease_like"]
IMG_SIZE = (224, 224)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--data-dir", type=Path, required=True, help="Folder with class subdirs")
    args = parser.parse_args()

    ds = keras.utils.image_dataset_from_directory(
        args.data_dir,
        labels="inferred",
        class_names=CLASS_NAMES,
        image_size=IMG_SIZE,
        batch_size=32,
        shuffle=False,
    )
    normalization = keras.layers.Rescaling(1.0 / 127.5, offset=-1)
    ds = ds.map(lambda x, y: (normalization(x), y))

    model = keras.models.load_model(args.model)
    y_true = []
    y_pred = []
    for batch_x, batch_y in ds:
        probs = model.predict(batch_x, verbose=0)
        y_true.extend(batch_y.numpy().tolist())
        y_pred.extend(np.argmax(probs, axis=1).tolist())

    print(classification_report(y_true, y_pred, target_names=CLASS_NAMES))
    print("Confusion matrix:")
    print(confusion_matrix(y_true, y_pred))


if __name__ == "__main__":
    main()
