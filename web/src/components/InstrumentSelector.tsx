import type { InstrumentPreset } from '../types'
import { CHROMATIC_ID } from '../services/tunings'

interface InstrumentSelectorProps {
  instruments: InstrumentPreset[]
  selectedId: string
  onSelect: (id: string) => void
}

export function InstrumentSelector({ instruments, selectedId, onSelect }: InstrumentSelectorProps) {
  const options = [{ id: CHROMATIC_ID, label: 'Chromatic' }, ...instruments.map((i) => ({ id: i.id, label: i.label }))]

  return (
    <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Instrument">
      {options.map((option) => {
        const isActive = option.id === selectedId
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(option.id)}
            className={`flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? 'border-[var(--accent-deep)] bg-[var(--accent-soft)] text-[var(--accent-deep)]'
                : 'border-[var(--line)] bg-[var(--panel-quiet)] text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
