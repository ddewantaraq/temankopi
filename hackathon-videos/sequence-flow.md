# Teman Kopi — end-to-end sequence (tech walkthrough)

Screen-record [`sequence-flow.html`](sequence-flow.html) fullscreen (open online once so Mermaid CDN loads). Pair with the tech VO in [`../HACKATHON_VIDEO_SCRIPTS.md`](../HACKATHON_VIDEO_SCRIPTS.md).

Training (spoken only, see [`tech-slide.html`](tech-slide.html)): DECAFIA → MobileNetV3Small → TF.js export → `public/models/teman-kopi/`.

## Sequence

```mermaid
sequenceDiagram
  participant Farmer
  participant PWA
  participant SW as ServiceWorker
  participant Cam as Camera
  participant Q as QualityGate
  participant Model as TFJS_WebGL
  participant Dec as DecisionEngine
  participant DB as IndexedDB
  participant Ext as Penyuluh

  Note over PWA,SW: First online visit caches shell plus model
  Farmer->>PWA: Open Teman Kopi
  PWA->>SW: Register and cache assets
  SW-->>PWA: model.json and weights ready offline

  Farmer->>PWA: Periksa Tanaman
  PWA->>Cam: Rear camera or gallery
  Cam-->>PWA: Leaf image
  Farmer->>PWA: Symptoms plus Analyze

  PWA->>Q: checkImageQuality
  alt Too dark blurry or flat
    Q-->>PWA: qualityFail
    PWA->>Dec: uncertain fail-safe
  else Quality OK
    Q-->>PWA: ok
    PWA->>Model: predict WebGL on device
    Model-->>PWA: healthy pest disease scores
    alt Low confidence or close top-2
      PWA->>Dec: uncertain fail-safe
    else Confident label
      PWA->>Dec: label plus scores plus symptoms
    end
  end

  Dec-->>PWA: title summary nextActions disclaimer
  PWA->>DB: saveObservation
  PWA-->>Farmer: Result screen
  Farmer->>Ext: WhatsApp share evidence
```

## VO beat cues (map while recording)

| Beat | Say (short) | Diagram focus |
|------|-------------|----------------|
| 1 | Small AI on the edge — no cloud API for analysis | Cache / SW |
| 2 | Capture leaf → quality gate | Camera → QualityGate |
| 3 | TF.js + WebGL on device → three-class scores | TFJS_WebGL |
| 4 | Low confidence → fail-safe, not a fake diagnosis | alt uncertain |
| 5 | Rule-based next steps → IndexedDB → penyuluh | Decision → DB → Ext |

Keep total spoken tech script ≤60s; use this diagram as the visual, not a second long VO.
