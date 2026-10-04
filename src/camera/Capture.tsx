import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n/LocaleContext'

interface CaptureProps {
  onCapture: (dataUrl: string, image: HTMLImageElement) => void
}

function stopStream(stream: MediaStream | null) {
  if (!stream) return
  for (const track of stream.getTracks()) track.stop()
}

export function Capture({ onCapture }: CaptureProps) {
  const t = useT()
  const fileCameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    return () => {
      stopStream(streamRef.current)
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!live) return
    const video = videoRef.current
    const stream = streamRef.current
    if (!video || !stream) return
    video.srcObject = stream
    void video.play().catch(() => undefined)
  }, [live])

  function emitCapture(dataUrl: string) {
    const img = new Image()
    img.onload = () => {
      setPreview(dataUrl)
      onCapture(dataUrl, img)
    }
    img.src = dataUrl
  }

  function handleFile(file: File | undefined) {
    if (!file) return
    stopLive()
    const reader = new FileReader()
    reader.onload = () => emitCapture(String(reader.result))
    reader.readAsDataURL(file)
  }

  function stopLive() {
    stopStream(streamRef.current)
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setLive(false)
  }

  async function startLiveCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      fileCameraRef.current?.click()
      return
    }
    try {
      stopLive()
      setPreview(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      })
      streamRef.current = stream
      setLive(true)
    } catch {
      stopLive()
      fileCameraRef.current?.click()
    }
  }

  function snapFromVideo() {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    stopLive()
    emitCapture(dataUrl)
  }

  function onPrimaryClick() {
    if (live) {
      snapFromVideo()
      return
    }
    if (preview) {
      setPreview(null)
      void startLiveCamera()
      return
    }
    void startLiveCamera()
  }

  return (
    <div className="capture">
      <div className="capture-frame">
        {live ? (
          <video ref={videoRef} className="capture-video" playsInline muted autoPlay />
        ) : preview ? (
          <img src={preview} alt={t.capture.previewAlt} />
        ) : (
          <p className="capture-placeholder">{t.scan.tip}</p>
        )}
      </div>
      <div className="btn-row">
        <button type="button" className="btn primary" onClick={onPrimaryClick}>
          {live || !preview ? t.scan.capture : t.scan.retake}
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            stopLive()
            galleryRef.current?.click()
          }}
        >
          {t.scan.gallery}
        </button>
      </div>
      <input
        ref={fileCameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}
