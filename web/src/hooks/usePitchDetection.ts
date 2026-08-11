import { useCallback, useEffect, useRef, useState } from 'react'
import { autoCorrelate, describePitch } from '../services/pitch'
import type { PitchReading } from '../types'

export type MicStatus = 'idle' | 'requesting' | 'listening' | 'denied' | 'error'

// 8192 samples (~171ms at 48kHz) — needed for autocorrelation to reliably
// resolve low bass/cello frequencies (a 2048 buffer gives a 41Hz bass low-E
// too few cycles to correlate cleanly: ~0.44 clarity vs. ~0.86 at 8192).
// Latency is fine for a tuner; it doesn't need frame-perfect responsiveness.
const BUFFER_SIZE = 8192
const MIN_CLARITY = 0.8
const MIN_FREQUENCY = 27 // below low B0, filters out rumble/handling noise
const MAX_FREQUENCY = 4200 // above the top of a violin E string + headroom

export function usePitchDetection() {
  const [status, setStatus] = useState<MicStatus>('idle')
  const [reading, setReading] = useState<PitchReading | null>(null)
  const [error, setError] = useState<string | null>(null)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const bufferRef = useRef<Float32Array<ArrayBuffer>>(new Float32Array(BUFFER_SIZE))

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    analyserRef.current = null
    if (audioCtxRef.current) {
      void audioCtxRef.current.close()
      audioCtxRef.current = null
    }
    setStatus('idle')
    setReading(null)
  }, [])

  const start = useCallback(async () => {
    setStatus('requesting')
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      streamRef.current = stream

      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = BUFFER_SIZE
      source.connect(analyser)
      analyserRef.current = analyser

      setStatus('listening')

      const tick = () => {
        const analyserNode = analyserRef.current
        const ctxNode = audioCtxRef.current
        if (!analyserNode || !ctxNode) return

        analyserNode.getFloatTimeDomainData(bufferRef.current)
        const result = autoCorrelate(bufferRef.current, ctxNode.sampleRate)

        if (result && result.clarity >= MIN_CLARITY && result.frequency >= MIN_FREQUENCY && result.frequency <= MAX_FREQUENCY) {
          setReading(describePitch(result.frequency, result.clarity))
        } else {
          setReading(null)
        }

        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } catch (err) {
      if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        setStatus('denied')
      } else {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Could not access the microphone.')
      }
    }
  }, [])

  useEffect(() => stop, [stop])

  return { status, reading, error, start, stop }
}
