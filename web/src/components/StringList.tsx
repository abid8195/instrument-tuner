import type { PitchReading, TuningString } from '../types'

interface StringListProps {
  strings: TuningString[]
  reading: PitchReading | null
  onPlayReference: (frequency: number) => void
}

function closestStringLabel(strings: TuningString[], reading: PitchReading | null): string | null {
  if (!reading) return null
  let best: TuningString | null = null
  let bestDiff = Infinity
  for (const str of strings) {
    const diff = Math.abs(str.frequency - reading.frequency)
    if (diff < bestDiff) {
      bestDiff = diff
      best = str
    }
  }
  // Only treat it as "targeting" a string if within roughly a semitone.
  return best && bestDiff / best.frequency < 0.06 ? best.label : null
}

export function StringList({ strings, reading, onPlayReference }: StringListProps) {
  const targetLabel = closestStringLabel(strings, reading)

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {strings.map((str) => {
        const isTarget = str.label === targetLabel
        return (
          <button
            key={str.label}
            type="button"
            onClick={() => onPlayReference(str.frequency)}
            title={`Play reference tone for ${str.label}`}
            className={`flex min-w-[3.5rem] flex-col items-center gap-0.5 rounded-2xl border px-3 py-2 transition-colors ${
              isTarget
                ? 'border-[var(--accent-deep)] bg-[var(--accent-soft)]'
                : 'border-[var(--line)] bg-[var(--panel-quiet)] hover:border-[var(--line-strong)]'
            }`}
          >
            <span className={`display-font text-lg font-semibold ${isTarget ? 'text-[var(--accent-deep)]' : 'text-[var(--ink)]'}`}>
              {str.name}
            </span>
            <span className="text-[0.65rem] text-[var(--muted)]">{str.octave}</span>
          </button>
        )
      })}
    </div>
  )
}
