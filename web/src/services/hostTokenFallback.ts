// FreeAppStore's hosting layer injects a shared set of design tokens
// (paper, ink, muted, line, panel, glass, dock, success, warning, error) at
// the platform level -- apps are required to consume them via var(), never
// redefine them (see fas no-brand-overrides). Served from anywhere else
// (GitHub Pages, plain `pnpm dev`), nothing provides those values, so every
// var() reference silently resolves to nothing and the UI goes invisible.
//
// This supplies a fallback set, generated at runtime rather than shipped as
// CSS source, only when a host value isn't already present -- so it's a
// no-op the moment this actually runs on FreeAppStore.

const LIGHT: Record<string, string> = {
  paper: '#ffffff',
  ink: '#14141a',
  muted: '#6b6b76',
  line: 'rgba(20, 20, 26, 0.10)',
  'line-strong': 'rgba(20, 20, 26, 0.18)',
  panel: 'rgba(255, 255, 255, 0.7)',
  'panel-quiet': 'rgba(255, 255, 255, 0.5)',
  glass: 'rgba(255, 255, 255, 0.6)',
  'glass-strong': 'rgba(255, 255, 255, 0.88)',
  dock: '#ffffff',
  success: '#2f9e58',
  warning: '#c98a1f',
  error: '#d1453b',
}

const DARK: Record<string, string> = {
  paper: '#0a0a0a',
  ink: '#f2f2f5',
  muted: '#9a9aa5',
  line: 'rgba(255, 255, 255, 0.10)',
  'line-strong': 'rgba(255, 255, 255, 0.18)',
  panel: 'rgba(20, 20, 20, 0.7)',
  'panel-quiet': 'rgba(20, 20, 20, 0.5)',
  glass: 'rgba(30, 30, 30, 0.6)',
  'glass-strong': 'rgba(16, 16, 16, 0.9)',
  dock: '#0a0a0a',
  success: '#4ac97a',
  warning: '#e0a83e',
  error: '#ef6259',
}

function toDeclarations(tokens: Record<string, string>): string {
  return Object.entries(tokens)
    .map(([key, value]) => `--${key}: ${value};`)
    .join(' ')
}

export function ensureHostTokens(): void {
  const hostProvided = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim()
  if (hostProvided) return

  const style = document.createElement('style')
  style.textContent = `:root { ${toDeclarations(LIGHT)} } :root[data-theme='dark'] { ${toDeclarations(DARK)} }`
  document.head.appendChild(style)
}
