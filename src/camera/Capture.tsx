import { useRef, useState } from 'react'
import { id as t } from '../i18n/id'

interface CaptureProps {
  onCapture: (dataUrl: string, image: HTMLImageElement) => void
}

export function Capture({ onCapture }: CaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function handleFile(file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result)
      const img = new Image()
      img.onload = () => {
        setPreview(dataUrl)
        onCapture(dataUrl, img)
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="capture">
      <div className="capture-frame">
        {preview ? (
          <img src={preview} alt="Pratinjau daun kopi" />
        ) : (
          <p className="capture-placeholder">{t.scan.tip}</p>
        )}
      </div>
      <div className="btn-row">
        <button
          type="button"
          className="btn primary"
          onClick={() => cameraRef.current?.click()}
        >
          {preview ? t.scan.retake : t.scan.capture}
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => galleryRef.current?.click()}
        >
          {t.scan.gallery}
        </button>
      </div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
