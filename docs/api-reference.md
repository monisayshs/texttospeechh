# Serverless API Reference — TextToSpeechH AI

---

## Document Ownership & Metadata

| Property | Value |
|----------|-------|
| **Document Purpose** | Reference for backend serverless endpoints (`api/*.js` and `src/api/*.js`) |
| **Owner** | Repository Maintainers |
| **Update Trigger** | API endpoint added, modified, deprecated, or response format changed |
| **Update Frequency** | Low-Medium — updated whenever API contracts evolve |
| **Last Verified** | 2026-08-07 |
| **Verified Against** | `api/index.js`, `api/generate.js`, `api/status.js`, `api/upload.js`, `api/index-now.js` |
| **Related Documents** | [AGENTS.md](../AGENTS.md), [docs/architecture.md](architecture.md), [docs/deployment.md](deployment.md) |

---

## Source of Truth

If this document conflicts with the implementation, **the source code is authoritative**. Documentation exists to accelerate understanding, not replace inspection of the code.

---

## 1. Overview

TextToSpeechH AI exposes backend HTTP endpoints via Vercel Serverless Functions (`/api/*`). Endpoints follow REST conventions, accept JSON or multipart/form-data inputs, return HTTP status codes, and include security header protections.

---

## 2. API Endpoints

### 2.1 Voice Generation (`/api/generate`)
Synthesizes text into an MP3 audio buffer using the LoadBalancer multi-provider engine.

- **HTTP Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "text": "Hello world, welcome to TextToSpeechH AI.",
    "voice": "en-US-AvaNeural",
    "speed": "1.0",
    "pitch": "0Hz"
  }
  ```
- **Response (Short Text <= 500 words)**:
  - **Status**: `200 OK`
  - **Content-Type**: `audio/mpeg`
  - **Body**: Binary MP3 audio buffer
- **Response (Long Text > 500 words - Async Queue)**:
  - **Status**: `202 Accepted`
  - **Content-Type**: `application/json`
  - **Body**:
    ```json
    {
      "success": true,
      "async": true,
      "jobId": "job_1723049100_a8f9",
      "message": "Long text queued for synthesis. Poll /api/status for progress."
    }
    ```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "Text prompt is empty or exceeds 10,000 word limit." }`
  - `429 Too Many Requests`: `{ "error": "Rate limit exceeded. Please wait 60 seconds." }`
  - `500 Internal Server Error`: `{ "error": "Voice synthesis failed across all active providers." }`

---

### 2.2 Async Job Status (`/api/status`)
Polls processing state for long-text synthesis jobs managed by `queueService.js`.

- **HTTP Method**: `GET`
- **Query Parameters**:
  - `jobId` (required): Unique job identifier string (e.g. `job_1723049100_a8f9`)
- **Example Request**: `GET /api/status?jobId=job_1723049100_a8f9`
- **Response (In Progress)**:
  - **Status**: `200 OK`
  - **Content-Type**: `application/json`
  - **Body**:
    ```json
    {
      "status": "processing",
      "progress": 65,
      "currentChunk": 13,
      "totalChunks": 20
    }
    ```
- **Response (Completed)**:
  - **Status**: `200 OK`
  - **Content-Type**: `application/json`
  - **Body**:
    ```json
    {
      "status": "completed",
      "progress": 100,
      "audioUrl": "/api/status?jobId=job_1723049100_a8f9&download=true"
    }
    ```
- **Response (Audio Stream Request - with `download=true`)**:
  - **Status**: `200 OK`
  - **Content-Type**: `audio/mpeg`
  - **Body**: Merged MP3 audio stream

---

### 2.3 Document Upload & Extraction (`/api/upload`)
Parses uploaded document files (`.txt`, `.pdf`, `.docx`) into plain text for voice synthesis.

- **HTTP Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Form Data Fields**:
  - `file`: Binary document payload (max size 10MB)
- **Response**:
  - **Status**: `200 OK`
  - **Content-Type**: `application/json`
  - **Body**:
    ```json
    {
      "success": true,
      "filename": "chapter1.pdf",
      "wordCount": 1420,
      "text": "Extracted text content from the PDF file..."
    }
    ```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "Unsupported file format. Please upload .txt, .pdf, or .docx." }`
  - `413 Payload Too Large`: `{ "error": "File size exceeds 10MB limit." }`

---

### 2.4 IndexNow Notification Bridge (`/api/index-now` & `/indexnow`)
Manual or API trigger to submit URLs to the IndexNow protocol.

- **HTTP Method**: `POST` or `GET`
- **Headers**: Optional `Authorization: Bearer <INDEXNOW_KEY>`
- **Response**:
  - **Status**: `200 OK`
  - **Body**: `{ "success": true, "message": "IndexNow ping submitted to Bing API." }`

---

## 3. Global Error Diagnostics

The API router (`api/index.js`) exposes explicit diagnostic paths for testing HTTP error handlers:

| Endpoint Path | Status Code | Returned Payload |
|---------------|-------------|------------------|
| `/500` | `500 Internal Server Error` | HTML string from `get500Page()` |
| `/403` | `403 Forbidden` | HTML string from `get403Page()` |
| `/429` | `429 Too Many Requests` | HTML string from `get429Page()` |
| `/503` | `503 Service Unavailable` | HTML string from `get503Page()` |
| `/404` | `404 Not Found` | HTML string from `get404Page()` |
