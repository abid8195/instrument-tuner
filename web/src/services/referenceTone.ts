let audioCtx: AudioContext | null = null
let activeOscillator: OscillatorNode | null = null

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

/** Plays a short sine-wave reference tone at the given frequency. */
export function playReferenceTone(frequency: number, durationSeconds = 1.2): void {
  stopReferenceTone()
  const ctx = getContext()
  if (ctx.state === 'suspended') void ctx.resume()

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequency

  const now = ctx.currentTime
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.2, now + 0.03)
  gain.gain.setValueAtTime(0.2, now + durationSeconds - 0.08)
  gain.gain.linearRampToValueAtTime(0, now + durationSeconds)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + durationSeconds)

  activeOscillator = osc
  osc.onended = () => {
    if (activeOscillator === osc) {
      activeOscillator = null
    }
  }
}

export function stopReferenceTone(): void {
  if (activeOscillator) {
    try {
      activeOscillator.stop()
    } catch {
      // already stopped
    }
    activeOscillator = null
  }
}
