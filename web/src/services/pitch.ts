import type { PitchReading } from '../types'

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

export function frequencyToMidi(frequency: number): number {
  return 69 + 12 * Math.log2(frequency / 440)
}

export function noteFrequency(name: string, octave: number): number {
  const index = NOTE_NAMES.indexOf(name as (typeof NOTE_NAMES)[number])
  const midi = (octave + 1) * 12 + index
  return midiToFrequency(midi)
}

/** Nearest-note reading for an arbitrary frequency, cents deviation included. */
export function describePitch(frequency: number, clarity = 0): PitchReading {
  const midi = frequencyToMidi(frequency)
  const rounded = Math.round(midi)
  const cents = Math.round((midi - rounded) * 100)
  const note = NOTE_NAMES[((rounded % 12) + 12) % 12]
  const octave = Math.floor(rounded / 12) - 1
  return { frequency, note, octave, cents, clarity }
}

interface AutocorrelationResult {
  frequency: number
  clarity: number
}

/**
 * Time-domain autocorrelation pitch detector (ACF2+). Trims quiet edges
 * below a signal-level threshold, finds the lag of peak self-similarity
 * past the first descending
 * slope (skips the zero-lag peak), then refines it with parabolic
 * interpolation for sub-sample precision. Standard technique for
 * monophonic instrument tuning — much cheaper than FFT-based approaches
 * and accurate enough for the ~1-4 cent precision a tuner needs.
 */
export function autoCorrelate(buffer: Float32Array, sampleRate: number): AutocorrelationResult | null {
  const size = buffer.length

  let rms = 0
  for (let i = 0; i < size; i++) {
    rms += buffer[i] * buffer[i]
  }
  rms = Math.sqrt(rms / size)
  if (rms < 0.01) return null // too quiet / silence

  const threshold = 0.2
  let start = 0
  let end = size - 1
  for (let i = 0; i < size / 2; i++) {
    if (Math.abs(buffer[i]) >= threshold) {
      start = i
      break
    }
  }
  for (let i = 1; i < size / 2; i++) {
    if (Math.abs(buffer[size - i]) >= threshold) {
      end = size - i
      break
    }
  }

  const trimmed = buffer.slice(start, end)
  const n = trimmed.length
  if (n < 2) return null

  const c = new Float32Array(n)
  for (let lag = 0; lag < n; lag++) {
    let sum = 0
    for (let i = 0; i < n - lag; i++) {
      sum += trimmed[i] * trimmed[i + lag]
    }
    c[lag] = sum
  }

  // Skip the initial descending slope from the zero-lag peak so we land on
  // the periodicity peak, not the trivial self-match at lag 0.
  let d = 0
  while (d < n - 1 && c[d] > c[d + 1]) d++

  let maxVal = -Infinity
  let maxPos = -1
  for (let i = d; i < n; i++) {
    if (c[i] > maxVal) {
      maxVal = c[i]
      maxPos = i
    }
  }
  if (maxPos <= 0) return null

  let t0 = maxPos
  const x1 = c[t0 - 1] ?? c[t0]
  const x2 = c[t0]
  const x3 = c[t0 + 1] ?? c[t0]
  const a = (x1 + x3 - 2 * x2) / 2
  const b = (x3 - x1) / 2
  if (a !== 0) t0 = t0 - b / (2 * a)
  if (t0 <= 0) return null

  const frequency = sampleRate / t0
  const clarity = c[0] > 0 ? Math.max(0, Math.min(1, maxVal / c[0])) : 0

  return { frequency, clarity }
}
