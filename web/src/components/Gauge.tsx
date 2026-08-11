interface GaugeProps {
  cents: number | null
  inTuneThreshold?: number
}

const RANGE = 50 // gauge spans -50..+50 cents
const CX = 150
const CY = 150
const RADIUS = 128

function angleForCents(cents: number): number {
  const clamped = Math.max(-RANGE, Math.min(RANGE, cents))
  // -50 cents -> -45deg (needle left), 0 -> 0deg (up), +50 -> +45deg (right)
  return (clamped / RANGE) * 45
}

function arcPoint(angleDeg: number, radius: number) {
  // 0deg = straight up, positive = clockwise, matching the needle's rotation.
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) }
}

function describeArc(startDeg: number, endDeg: number, radius: number) {
  const start = arcPoint(startDeg, radius)
  const end = arcPoint(endDeg, radius)
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

export function Gauge({ cents, inTuneThreshold = 5 }: GaugeProps) {
  const active = cents !== null
  const displayCents = cents ?? 0
  const needleAngle = angleForCents(displayCents)
  const inTune = active && Math.abs(displayCents) <= inTuneThreshold

  const zoneColor = !active
    ? 'var(--line-strong)'
    : inTune
      ? 'var(--success)'
      : Math.abs(displayCents) <= 20
        ? 'var(--warning)'
        : 'var(--error)'

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 300 190" className="w-full max-w-sm" role="img" aria-label="Tuning gauge">
        <path
          d={describeArc(-45, 45, RADIUS)}
          fill="none"
          stroke="var(--line)"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <path
          d={describeArc(-inTuneThreshold * 0.9, inTuneThreshold * 0.9, RADIUS)}
          fill="none"
          stroke="var(--success)"
          strokeOpacity={0.35}
          strokeWidth={14}
          strokeLinecap="round"
        />

        {[-50, -25, 0, 25, 50].map((tick) => {
          const inner = arcPoint(angleForCents(tick), RADIUS - 12)
          const outer = arcPoint(angleForCents(tick), RADIUS + 10)
          return (
            <line
              key={tick}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--muted)"
              strokeWidth={tick === 0 ? 3 : 1.5}
            />
          )
        })}

        <g style={{ transition: 'transform 90ms ease-out' }} transform={`rotate(${needleAngle} ${CX} ${CY})`}>
          <line x1={CX} y1={CY} x2={CX} y2={CY - RADIUS + 18} stroke={zoneColor} strokeWidth={4} strokeLinecap="round" />
          <circle cx={CX} cy={CY} r={9} fill={zoneColor} />
        </g>
      </svg>

      <div className="-mt-6 text-center">
        <div className="tabular-nums display-font text-4xl font-semibold" style={{ color: zoneColor }}>
          {active ? `${displayCents > 0 ? '+' : ''}${displayCents}` : '—'}
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">cents</div>
      </div>
    </div>
  )
}
