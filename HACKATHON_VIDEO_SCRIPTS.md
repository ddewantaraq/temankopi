# Teman Kopi — Hackathon video scripts (≤1 min each)

Speak at a calm pace (~140 words/min). Target **~130–145 words** so you finish under 60 seconds.

English for international judges; swap “extension officer” → “penyuluh” if you film Bahasa.

| | |
|---|---|
| **Builder** | Dimas Dewantara (solo) |
| **LinkedIn** | https://www.linkedin.com/in/mdimasdewantara/ |
| **Live app** | https://temankopi.vercel.app |
| **Tech slide** | Open [`hackathon-videos/tech-slide.html`](hackathon-videos/tech-slide.html) in a browser (fullscreen) |
| **Teleprompter** | Open [`hackathon-videos/teleprompter.html`](hackathon-videos/teleprompter.html) while recording |

Put LinkedIn + app URL in each video **description**, not necessarily spoken.

**Suggested description (paste under every upload):**

```
Teman Kopi — Small AI for Indonesian coffee farmers (World Bank hackathon).
Solo builder: Dimas Dewantara
LinkedIn: https://www.linkedin.com/in/mdimasdewantara/
App: https://temankopi.vercel.app
```

---

## 1) Team introduction (~55s)

**On screen:** You on camera (or name card + LinkedIn). Title: *Teman Kopi — solo builder*

### Script

Hi — I’m Dimas Dewantara, solo builder of Teman Kopi.

I’m a software builder focused on practical AI that works in the field, not only in the cloud. For this World Bank Small AI challenge, I asked: how can one better agricultural decision happen on a basic smartphone — offline — for Indonesian coffee farmers?

Teman Kopi is my answer: an offline PWA that screens a coffee leaf photo on-device, saves the observation, and connects evidence to a penyuluh — an extension officer — without pretending to be a diagnosis.

I designed, trained, and shipped it end to end: vision model, fail-safe logic, Bahasa UI, and deployment.

One builder, one decision loop, built for trust.

### Notes

- **Word count:** ~120
- **B-roll ideas:** LinkedIn QR/name, phone in hand, coffee leaf, app home screen

---

## 2) Product demo (~60s)

**Format:** Screen recording on phone (preferred) + short VO. Follow this shot order; don’t narrate every tap.

### Shot list (timebox)

1. **0–5s** — Home: Teman Kopi, offline badge, “Periksa Tanaman”
2. **5–15s** — Airplane mode on (Control Center), then open app
3. **15–35s** — Capture/gallery leaf → symptoms → Analisis → result + next steps
4. **35–45s** — Save → Riwayat (history)
5. **45–55s** — Blurry/junk or low-confidence path → Fail-safe “Belum cukup yakin” + Hubungi penyuluh
6. **55–60s** — WhatsApp share sheet or About one beat (DECAFIA only)

### VO script (opener + demo · ≤60s total)

**A. Problem → solution (say first, ~10–15s)**

In the coffee plot, farmers often see leaf spots but lack one clear next step — and guessing wrong erodes trust in advisory. Teman Kopi is Small AI on the phone: screen the leaf on-device, document the observation, and connect that evidence to a penyuluh — an extension officer — for the next decision.

**B. Demo walkthrough (while screen-recording, ~40–45s)**

Airplane mode on — the model still runs. I photograph a leaf, add what I see, and analyze on-device. Screening result and next steps appear; I save to history. If confidence is low, we fail safe: ask a penyuluh — no fake diagnosis, no spray recipe. One better step with trusted human advice.

### Notes

- **Word count:** ~120 total (opener + demo)
- Open with A on home/leaf B-roll or first home frame, then B synced to taps
- Use a **clear coffee leaf** first, then one fail-safe clip

---

## 3) Technical walkthrough (~60s)

**On screen:** [`hackathon-videos/sequence-flow.html`](hackathon-videos/sequence-flow.html) (end-to-end sequence) and/or [`hackathon-videos/tech-slide.html`](hackathon-videos/tech-slide.html) (3 boxes). Keep visual simple. Mermaid source + VO cues: [`hackathon-videos/sequence-flow.md`](hackathon-videos/sequence-flow.md).

**Slide labels:** `Train DECAFIA` → `TF.js + WebGL` → `Fail-safe → penyuluh`

### Script

Technically, Teman Kopi is Small AI on the edge.

Vision: MobileNetV3Small, three classes — healthy, pest-like, disease-like — trained on DECAFIA CoffeeLeaf-CO, exported to TensorFlow.js, inferred with WebGL in the browser. No cloud API for analysis.

Trust layers: photo quality gate, confidence threshold, top-two margin — otherwise uncertain. Guidance text is rule-based, not an LLM, so we never invent pesticide doses.

Product shell: Vite PWA, service worker caches the model for offline use, IndexedDB stores observations, WhatsApp hands evidence to an extension officer.

Honest limit: labeled Indonesian leaf data isn’t enough yet, so we start from an open dataset and fail safe — path forward is local field photos with farmers and penyuluh.

That’s the stack: compress, run offline, stay humble.

### Notes

- **Word count:** ~135
- One take; cut silence only

---

## Recording tips

- One take per video; cut silence only
- Product demo: clear coffee leaf first, then fail-safe
- Say “penyuluh” once in EN videos for local authenticity, then “extension officer”
- Put LinkedIn + temankopi.vercel.app in each video description

## Checklist before upload

- [ ] Each video under **60 seconds**
- [ ] Product demo shows **airplane mode** + **fail-safe**
- [ ] No pesticide / definitive diagnosis claims
- [ ] Descriptions include LinkedIn + https://temankopi.vercel.app
