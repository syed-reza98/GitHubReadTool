# Real-Time Motorbike Helmet Detection

Overview

A computer vision pipeline for detecting motorbike riders and whether they wear helmets. Built for real-time inference and dataset publishing on Roboflow.

Code & Dataset

- Annotated images for three classes: `Person on Motorbike`, `Helmet`, `No Helmet`.
- Trained with Scaled YOLOv4 (or similar YOLO-family model) for object detection.
- Dataset published on Roboflow: Bike Helmet Detection project.

Architecture

- Data collection and annotation -> model training (YOLO) -> export -> real-time inference engine.
- Inference can run on a GPU-enabled server or edge device with optimized model (TensorRT/ONNX) for low latency.

Tech stack

- Python, PyTorch (or Darknet/YOLO framework), OpenCV
- Roboflow for dataset management and hosting
- Optional: TensorRT / ONNX for accelerated inference

Status

- Dataset annotated and published. Model achieves ~70% accuracy (as measured during experimentation).

Usage

- Use for CCTV/edge detection systems, traffic safety analytics, or as a baseline for further improvements.

Notes

- Improve dataset diversity and augmentation to increase accuracy.
- Consider multi-scale training and transfer learning from state-of-the-art detectors.
