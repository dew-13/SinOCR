# Training a Sinhala Handwritten Text Recognition Pipeline with YOLOv8 and Transformers

This document outlines a comprehensive approach to building a system that can read handwritten Sinhala text from a scanned form, recognize the text, and map it to the appropriate fields in a digital form.

## System Overview

The pipeline can be broken down into four main phases:

1.  **Field Detection:** Using a YOLOv8 model to identify the locations of form fields and the corresponding handwritten text in the scanned image.
2.  **Handwritten Text Recognition (HTR):** Using a Transformer-based model to recognize the Sinhala characters within the bounding boxes identified by YOLOv8.
3.  **Data Mapping and Translation:** Mapping the recognized text to the correct form fields and translating specific fields from Sinhala to English.
4.  **API and Frontend Integration:** Wrapping the entire pipeline in an API that the frontend application can communicate with.

---

## Phase 1: Field Detection with YOLOv8

The first step is to locate the areas of interest in the scanned document. YOLOv8, a state-of-the-art object detection model, is an excellent tool for this.

### Objective

Train a YOLOv8 model to detect the bounding boxes of:
*   The labels of the form fields (e.g., "Province", "District").
*   The handwritten answers corresponding to each label.

### Data Preparation and Annotation

1.  **Collect a Dataset:** Gather a collection of scanned forms filled with handwritten Sinhala text.
2.  **Annotate the Images:** Use an annotation tool (like LabelImg, Roboflow, or CVAT) to draw bounding boxes around each field label and each handwritten answer. You should create distinct classes for each field you want to capture, for example: `province_label`, `province_handwriting`, `district_label`, `district_handwriting`, etc. This level of detail will help in accurately associating handwritten text with its corresponding field.

### Training

1.  **Set up YOLOv8:** Follow the official YOLOv8 documentation to set up the training environment.
2.  **Train the Model:** Train the YOLOv8 model on your annotated dataset. The model will learn to identify the locations of all the fields you've annotated.
3.  **Output:** The trained model will take a scanned form as input and output a list of bounding boxes with class labels and confidence scores.

---

## Phase 2: Handwritten Text Recognition (HTR) with a Transformer Model

Once you have the bounding boxes for the handwritten text, you need to recognize the characters in those cropped images. A Transformer-based model, such as a Vision Transformer (ViT) with a text decoder, is ideal for this sequence-to-sequence task.

### Objective

Train a model that takes an image of a handwritten Sinhala word or line of text and outputs the recognized text string.

### Data Preparation

1.  **Create an HTR Dataset:** This is often the most challenging part. You need a dataset of cropped images of handwritten Sinhala words or text lines, paired with their ground truth transcriptions. You can create this by:
    *   Using the bounding boxes from your YOLOv8 step and manually transcribing the text.
    *   Finding existing Sinhala handwritten text datasets.
2.  **Pre-process the Images:** The cropped images should be resized to a consistent size and normalized.

### Model Architecture

A common architecture for HTR is an encoder-decoder model:
*   **Encoder:** A Convolutional Neural Network (CNN) or a Vision Transformer (ViT) acts as the feature extractor, taking the image as input and generating a rich feature representation.
*   **Decoder:** A Transformer decoder or an LSTM-based recurrent neural network (RNN) takes the image features and generates the sequence of characters.

### Training

Train the HTR model on your prepared dataset. The model will learn the mapping from the visual features of the handwriting to the sequence of Sinhala characters.

---

## Phase 3: Data Mapping and Translation

After recognizing the text, you need to structure it and translate certain fields.

1.  **Mapping:** Using the class labels from your YOLOv8 output, you can map the recognized text from the HTR model to the correct field. For example, the text recognized from a bounding box with the label `province_handwriting` belongs to the "Province" field.
2.  **Translation:** For fields like "Province", "District", "Sex", and "Marital status", you'll want to store a standardized value (likely in English) in your database. You can use a simple JSON file for this mapping.

Your existing `ocr/sinhala_to_english.json` file is perfect for this. It would look something like this:

```json
{
  "province": {
    "බස්නාහිර": "Western",
    "මධ්‍යම": "Central",
    ...
  },
  "sex": {
    "පුරුෂ": "Male",
    "ස්ත්‍රී": "Female"
  },
  ...
}
```

---

## Phase 4: API and Frontend Integration

The final step is to put all the pieces together and expose them through an API.

### Backend API

1.  **Create an API Endpoint:** Using a framework like Flask or FastAPI in Python, create an endpoint (e.g., `/api/ocr`) that accepts an image file.
2.  **Implement the Pipeline:**
    *   The endpoint receives the image.
    *   It passes the image to the YOLOv8 model to get the bounding boxes.
    *   For each relevant handwritten text box, it crops the image and sends it to the HTR model for recognition.
    *   It then uses the mapping and translation logic to build a structured JSON object.
    *   The API returns this JSON object to the client.

**Example API Response:**
```json
{
  "province": "Western",
  "district": "Colombo",
  "sex": "Male",
  "marital_status": "Single",
  ...
}
```

### Frontend Integration

Your Next.js application can then interact with this API:
1.  The user uploads a scanned form in the browser.
2.  The frontend sends this image to the `/api/ocr` endpoint.
3.  It receives the structured JSON data back and populates the fields of the digital form (`components/students/student-form.tsx`).

This modular approach allows you to develop and improve each part of the system independently.
