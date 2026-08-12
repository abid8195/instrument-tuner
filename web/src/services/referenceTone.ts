const PLUCKED_INSTRUMENTS = new Set(['guitar', 'ukulele', 'bass'])
const BOWED_INSTRUMENTS = new Set(['violin', 'cello'])

let audioCtx: AudioContext | null = null
let activeStoppers: Array<() => void> = []

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

function registerStoppers(...nodes: AudioScheduledSourceNode[]): void {
  activeStoppers = nodes.map((node) => () => {
    try {
      node.stop()
    } catch {
      // already stopped
    }
  })
}

/**
 * Karplus-Strong plucked-string synthesis: seed a delay line the length of
 * one period with noise, then repeatedly feed each sample back through a
 * 2-tap averaging (lowpass) filter with slight decay. That feedback loop is
 * a crude physical model of a vibrating string losing energy to damping and
 * air resistance -- it produces a naturally decaying, harmonically rich
 * pluck, unlike a bare oscillator tone which just holds a flat, synthetic
 * pitch until it's cut off.
 */
function synthesizePluck(ctx: AudioContext, frequency: number, durationSeconds: number): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const totalSamples = Math.floor(sampleRate * durationSeconds)
  const period = Math.max(2, Math.round(sampleRate / frequency))
  const ring = new Float32Array(period)
  for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1

  const buffer = ctx.createBuffer(1, totalSamples, sampleRate)
  const out = buffer.getChannelData(0)
  const decay = 0.995
  let prev = 0
  for (let i = 0; i < totalSamples; i++) {
    const idx = i % period
    const current = ring[idx]
    out[i] = current
    ring[idx] = decay * 0.5 * (current + prev)
    prev = current
  }

  // Short fade-out at the tail so truncation doesn't click.
  const fadeSamples = Math.min(totalSamples, Math.floor(sampleRate * 0.04))
  for (let i = 0; i < fadeSamples; i++) {
    out[totalSamples - fadeSamples + i] *= 1 - i / fadeSamples
  }

  return buffer
}

function playPluck(frequency: number, durationSeconds = 1.6): void {
  const ctx = getContext()
  if (ctx.state === 'suspended') void ctx.resume()

  const source = ctx.createBufferSource()
  source.buffer = synthesizePluck(ctx, frequency, durationSeconds)

  // Real plucked strings roll off high harmonics quickly; this softens the
  // seed noise burst into something string-like rather than papery/harsh.
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = Math.min(8000, frequency * 14)

  const gain = ctx.createGain()
  gain.gain.value = 0.5

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start()

  registerStoppers(source)
}

function playBowed(frequency: number, durationSeconds = 1.6): void {
  const ctx = getContext()
  if (ctx.state === 'suspended') void ctx.resume()

  const osc = ctx.createOscillator()
  osc.type = 'sawtooth' // harmonically rich, much closer to a bowed string than a sine
  osc.frequency.value = frequency

  // Real bowing rarely holds a perfectly static pitch -- a slow, shallow
  // vibrato sells the "sustained, human-driven" character.
  const vibrato = ctx.createOscillator()
  vibrato.frequency.value = 5.5
  const vibratoGain = ctx.createGain()
  vibratoGain.gain.value = frequency * 0.006
  vibrato.connect(vibratoGain)
  vibratoGain.connect(osc.frequency)

  // Tames the sawtooth's harsh upper harmonics toward a bowed tone.
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = frequency * 6
  filter.Q.value = 0.7

  const gain = ctx.createGain()
  const now = ctx.currentTime
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.16, now + 0.08) // bow catching the string
  gain.gain.setValueAtTime(0.16, now + durationSeconds - 0.12)
  gain.gain.linearRampToValueAtTime(0, now + durationSeconds)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  vibrato.start(now)
  osc.stop(now + durationSeconds)
  vibrato.stop(now + durationSeconds)

  registerStoppers(osc, vibrato)
}

/**
 * Plays a reference tone for the given frequency, synthesized to roughly
 * match how the target instrument actually produces sound: plucked-string
 * modeling for guitar/ukulele/bass, a sustained bowed tone for
 * violin/cello, and a plain pluck as a neutral default (e.g. chromatic
 * mode, where there's no specific instrument to model).
 */
export function playReferenceTone(frequency: number, instrumentId?: string): void {
  stopReferenceTone()
  if (instrumentId && BOWED_INSTRUMENTS.has(instrumentId)) {
    playBowed(frequency)
  } else {
    playPluck(frequency, PLUCKED_INSTRUMENTS.has(instrumentId ?? '') ? 1.6 : 1.2)
  }
}

export function stopReferenceTone(): void {
  for (const stop of activeStoppers) stop()
  activeStoppers = []
}
