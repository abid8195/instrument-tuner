import type { InstrumentPreset, TuningString } from '../types'
import { noteFrequency } from './pitch'

function s(name: string, octave: number): TuningString {
  return { name, octave, label: `${name}${octave}`, frequency: noteFrequency(name, octave) }
}

export const INSTRUMENTS: InstrumentPreset[] = [
  {
    id: 'guitar',
    label: 'Guitar',
    strings: [s('E', 2), s('A', 2), s('D', 3), s('G', 3), s('B', 3), s('E', 4)],
  },
  {
    id: 'violin',
    label: 'Violin',
    strings: [s('G', 3), s('D', 4), s('A', 4), s('E', 5)],
  },
  {
    id: 'cello',
    label: 'Cello',
    strings: [s('C', 2), s('G', 2), s('D', 3), s('A', 3)],
  },
  {
    id: 'ukulele',
    label: 'Ukulele',
    strings: [s('G', 4), s('C', 4), s('E', 4), s('A', 4)],
  },
  {
    id: 'bass',
    label: 'Bass',
    strings: [s('E', 1), s('A', 1), s('D', 2), s('G', 2)],
  },
]

export const CHROMATIC_ID = 'chromatic'
