import { useMemo, useState } from 'react'
import { Shell } from './components/Shell.tsx'
import { Gauge } from './components/Gauge.tsx'
import { InstrumentSelector } from './components/InstrumentSelector.tsx'
import { StringList } from './components/StringList.tsx'
import { usePitchDetection } from './hooks/usePitchDetection.ts'
import { INSTRUMENTS, CHROMATIC_ID } from './services/tunings.ts'
import { playReferenceTone } from './services/referenceTone.ts'

export default function App() {
  const [instrumentId, setInstrumentId] = useState<string>('guitar')
  const { status, reading, error, start } = usePitchDetection()

  const activeInstrument = useMemo(
    () => INSTRUMENTS.find((i) => i.id === instrumentId) ?? null,
    [instrumentId],
  )

  const isListening = status === 'listening'
  const noteLabel = reading ? `${reading.note}${reading.octave}` : '—'

  return (
    <Shell>
      <div className="flex flex-1 flex-col items-center gap-8 py-6">
        <InstrumentSelector instruments={INSTRUMENTS} selectedId={instrumentId} onSelect={setInstrumentId} />

        <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-[1.25rem] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow-card)]">
          <Gauge cents={isListening ? (reading?.cents ?? null) : null} />

          <div className="display-font text-6xl font-bold text-[var(--ink)]">{isListening ? noteLabel : '—'}</div>

          {isListening && (
            <p className="text-sm text-[var(--muted)]">
              {reading ? `${reading.frequency.toFixed(1)} Hz` : 'Listening…'}
            </p>
          )}

          {status === 'idle' && (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-[var(--muted)]">
                Enable your microphone to start real-time pitch detection.
                Audio is processed entirely on your device and never leaves
                the browser.
              </p>
              <button
                type="button"
                onClick={() => void start()}
                className="flex min-h-11 items-center rounded-xl bg-[var(--accent-deep)] px-5 text-sm font-semibold text-[var(--paper)] transition-opacity hover:opacity-90"
              >
                Enable microphone
              </button>
            </div>
          )}

          {status === 'requesting' && <p className="text-sm text-[var(--muted)]">Requesting microphone access…</p>}

          {status === 'denied' && (
            <p className="text-center text-sm text-[var(--error)]">
              Microphone access was denied. Allow it in your browser's site
              settings and reload to use the tuner.
            </p>
          )}

          {status === 'error' && (
            <p className="text-center text-sm text-[var(--error)]">
              {error ?? 'Something went wrong accessing the microphone.'}
            </p>
          )}
        </div>

        {activeInstrument && instrumentId !== CHROMATIC_ID && (
          <div className="flex w-full max-w-md flex-col items-center gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              {activeInstrument.label} strings — tap to hear a reference tone
            </p>
            <StringList
              strings={activeInstrument.strings}
              reading={reading}
              onPlayReference={(frequency) => playReferenceTone(frequency, instrumentId)}
            />
          </div>
        )}
      </div>
    </Shell>
  )
}
