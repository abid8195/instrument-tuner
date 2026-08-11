export interface TuningString {
  name: string
  octave: number
  label: string
  frequency: number
}

export interface InstrumentPreset {
  id: string
  label: string
  strings: TuningString[]
}

export interface PitchReading {
  frequency: number
  note: string
  octave: number
  cents: number
  clarity: number
}
