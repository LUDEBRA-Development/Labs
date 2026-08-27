import { useNavigate } from 'react-router-dom'

const FEATURED_SIMULATORS = [
  {
    key: 'capacitancia',
    title: 'Capacitancia',
    description: 'Análisis de almacenamiento de carga, dieléctricos y configuraciones en serie/paralelo.',
    status: { label: 'Módulo Activo', progress: 42, locked: false },
    icon: <ZapIcon className="h-5 w-5 text-secondary" />,
    visual: <CapacitorVisual />,
  },
  {
    key: 'ley-de-ohm',
    title: 'Ley de Ohm',
    description: 'Relación fundamental entre voltaje, corriente y resistencia en circuitos DC.',
    status: { label: 'Completado', progress: 100, locked: false },
    icon: <OhmIcon className="h-5 w-5 text-secondary" />,
    visual: <OhmVisual />,
  },
  {
    key: 'campos-magneticos',
    title: 'Campos Magnéticos',
    description: 'Visualización de líneas de campo, ley de Biot-Savart e inducción.',
    status: { label: 'Requiere Nivel 2', progress: 0, locked: true },
    icon: <MagnetIcon className="h-5 w-5 text-secondary" />,
    visual: <LockedVisual />,
  },
]

export function Landing() {
  const navigate = useNavigate()

  function scrollToSimuladores(e) {
    e.preventDefault()
    document.getElementById('simuladores')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* ===================== HEADER ===================== */}
      <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <FlaskIcon className="h-5 w-5 text-secondary" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-on-surface">LUDEBRA LABS</span>
          </div>

          <div className="flex items-center gap-8">
            <nav className="hidden items-center gap-8 text-sm font-medium text-on-surface-variant sm:flex">
              <a href="#simuladores" onClick={scrollToSimuladores} className="transition-colors hover:text-primary">
                Simuladores
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="transition-colors hover:text-primary">
                Cursos
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="transition-colors hover:text-primary">
                Soporte
              </a>
            </nav>

            <button
              onClick={() => navigate('/login')}
              className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:opacity-90 sm:inline-flex"
            >
              Ingresar
            </button>
          </div>
        </div>
      </header>

      {/* ===================== HERO ===================== */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-10">
          <div className="w-full min-w-0 lg:w-1/2">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              Entorno de simulación avanzada
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-on-surface sm:text-5xl">
              Laboratorio Virtual de
              <br />
              <span className="text-secondary">Circuitos y</span>
              <br />
              Electromagnetismo
            </h1>
            <p className="mt-8 text-base leading-relaxed text-on-surface-variant">
              Plataforma de alta precisión para la experimentación y análisis de fenómenos
              electromagnéticos. Diseñada para estudiantes e investigadores con herramientas de
              simulación interactiva.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 rounded-lg bg-secondary px-5 py-3 text-sm font-semibold text-on-secondary shadow-level-1 transition hover:opacity-90"
              >
                Ingresar al Laboratorio
                <ArrowRightIcon className="h-4 w-4" />
              </button>
              <a
                href="#simuladores"
                onClick={scrollToSimuladores}
                className="inline-flex items-center rounded-lg border border-primary px-5 py-3 text-sm font-semibold text-primary transition hover:bg-surface-container-low"
              >
                Conocer Más
              </a>
            </div>
          </div>

          <div className="w-full min-w-0 lg:w-1/2">
            <HeroPanel />
          </div>
        </div>
      </section>

      {/* ===================== SIMULADORES DESTACADOS ===================== */}
      <section id="simuladores" className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6">
        <div className="flex flex-col gap-2 border-b border-outline-variant pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-on-surface sm:text-3xl">Simuladores Destacados</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Módulos de experimentación disponibles.</p>
          </div>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:underline"
          >
            Ver todos
            <ChevronRightIcon className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_SIMULATORS.map((sim) => (
            <SimulatorCard key={sim.key} sim={sim}/>
          ))}
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="mt-auto bg-primary text-on-primary">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                <FlaskIcon className="h-4 w-4 text-on-secondary" />
              </div>
              <span className="text-base font-extrabold tracking-tight">LUDEBRA LABS</span>
            </div>
            <p className="mt-3 text-sm text-on-primary/70">
              Laboratorio Virtual de Circuitos y Electromagnetismo
            </p>
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-on-primary/60">
              Desarrollado en alianza con
            </p>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <CapIcon className="h-6 w-6 text-secondary" />
              <span className="text-sm font-semibold leading-tight">
                Universidad Popular
                <br />
                del Cesar
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex w-full max-w-7xl flex-col-reverse items-center gap-3 px-4 py-5 text-xs text-on-primary/60 sm:flex-row sm:justify-between sm:px-6">
            <p>© 2024 Ludebra Labs. Todos los derechos reservados.</p>
            <div className="flex items-center gap-5">
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-on-primary">
                Términos
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-on-primary">
                Privacidad
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ===================== SUBCOMPONENTES ===================== */

function HeroPanel() {
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-level-2">
      <div className="circuit-pattern absolute inset-0" style={{ opacity: 1 }} />
      <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-primary via-[#0d2938] to-[#122f40] p-6 sm:p-8">
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,175,235,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,175,235,0.5) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative flex items-center gap-2 text-on-primary/70">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-secondary/20">
            <FlaskIcon className="h-3.5 w-3.5 text-secondary" />
          </div>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
            Ludebra Labs — Virtual Simulation Engine
          </span>
        </div>

        <div className="relative mt-8 flex h-full items-center justify-center">
          <FieldLinesGraphic />
        </div>

        <div className="absolute bottom-5 left-5 right-5 flex overflow-hidden rounded-xl border border-white/10 bg-[#0a1f2e]/80 backdrop-blur">
          <div className="flex-1 px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-on-primary/50">Voltaje</p>
            <p className="mt-0.5 text-lg font-bold text-on-primary">12.4V</p>
          </div>
          <div className="w-px bg-white/10" />
          <div className="flex-1 px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-on-primary/50">Corriente</p>
            <p className="mt-0.5 text-lg font-bold text-on-primary">0.85A</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldLinesGraphic() {
  return (
    <svg viewBox="0 0 240 140" className="h-32 w-auto opacity-90 sm:h-40">
      {[0, 1, 2, 3].map((i) => (
        <ellipse
          key={i}
          cx="120"
          cy="70"
          rx={30 + i * 24}
          ry={18 + i * 13}
          fill="none"
          stroke="#00afeb"
          strokeOpacity={0.55 - i * 0.1}
          strokeWidth="1.5"
        />
      ))}
      <circle cx="120" cy="70" r="7" fill="#00afeb" />
    </svg>
  )
}

function SimulatorCard({ sim }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-level-1 transition hover:shadow-level-2 transition-transform duration-300 hover:scale-105">
      <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden bg-[#eef3f6]">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(#c7d6dd 1px, transparent 1px), linear-gradient(90deg, #c7d6dd 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
        <div className="relative">{sim.visual}</div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          {sim.icon}
          <h3 className="text-base font-bold text-on-surface">{sim.title}</h3>
        </div>
        <p className="text-sm leading-relaxed text-on-surface-variant">{sim.description}</p>

        {sim.status.locked ? (
          <p className="mt-auto flex items-center gap-1.5 pt-2 font-mono text-xs text-on-surface-variant">
            <LockIcon className="h-3.5 w-3.5" />
            {sim.status.label}
          </p>
        ) : (
          <div className="mt-auto flex items-center gap-3 pt-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container">
              <div
                className="h-full rounded-full bg-secondary"
                style={{ width: `${sim.status.progress}%` }}
              />
            </div>
            <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-wide text-on-surface-variant">
              {sim.status.label}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function CapacitorVisual() {
  return (
    <svg viewBox="0 0 140 90" className="h-20 w-auto">
      <line x1="10" y1="45" x2="55" y2="45" stroke="#1e3741" strokeWidth="2" />
      <line x1="85" y1="45" x2="130" y2="45" stroke="#1e3741" strokeWidth="2" />
      <rect x="55" y="20" width="7" height="50" fill="#00afeb" />
      <rect x="78" y="20" width="7" height="50" fill="#00afeb" opacity="0.6" />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M ${66 + i * 6} 15 q 6 30 0 60`}
          fill="none"
          stroke="#00afeb"
          strokeOpacity="0.35"
          strokeWidth="1"
        />
      ))}
    </svg>
  )
}

function OhmVisual() {
  return (
    <svg viewBox="0 0 140 90" className="h-20 w-auto">
      <rect x="10" y="30" width="30" height="30" rx="4" fill="#1e3741" />
      <path
        d="M 40 45 h 20 l 5 -10 l 8 20 l 8 -20 l 8 20 l 5 -10 h 20"
        fill="none"
        stroke="#00afeb"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="122" cy="45" r="6" fill="#00afeb" />
    </svg>
  )
}

function MagnetIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M6 15a6 6 0 0 1 12 0v3H6v-3Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 15H2M22 15h-4" strokeLinecap="round" />
    </svg>
  )
}

function LockedVisual() {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-level-1">
      <LockIcon className="h-6 w-6 text-on-surface-variant" />
    </div>
  )
}

function FlaskIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M9 3h6M10 3v6.5L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9.5V3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ZapIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function OhmIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M5 19h14M8 19v-3a4 4 0 1 1 8 0v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CapIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M2 9l10-5 10 5-10 5-10-5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowRightIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRightIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default Landing
