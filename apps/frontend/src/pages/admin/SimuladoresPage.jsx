import { useEffect, useState } from 'react'
import { simulatorsApi } from '../../modules/actividades/api/simulatorApi'

const DEFAULT_SIMULATORS = [
  {
    idSimulador: 1,
    name: 'Laboratorio Dieléctrico',
    url: 'https://laboratorio-virtual-delta.vercel.app/',
    description:
      'Laboratorio virtual para experimentar con la carga almacenada, la diferencia de potencial, el trabajo y la energía en capacitores.',
    status: true,
  },
  {
    idSimulador: 2,
    name: 'Calculadora de Capacitancia',
    url: 'https://calculadoradecapacitancia.netlify.app/index.html',
    description:
      'Calculadora interactiva de capacitancia equivalente en configuraciones en serie y en paralelo, ideal para validar cálculos de circuitos.',
    status: true,
  },
]

export function SimuladoresPage() {
  const [simulators, setSimulators] = useState(DEFAULT_SIMULATORS)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    // Se despacha en una microtarea para no invocar setState de forma
    // síncrona en el cuerpo del efecto.
    queueMicrotask(async () => {
      try {
        const data = await simulatorsApi.findAll()
        setSimulators(data.length > 0 ? data : DEFAULT_SIMULATORS)
      } catch {
        setFeedback({ type: 'error', text: 'No se pudo cargar la lista de simuladores.' })
        setSimulators(DEFAULT_SIMULATORS)
      } finally {
        setLoading(false)
      }
    })
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Catálogo de simuladores</h1>
        <p className="text-slate-500">
          Simuladores disponibles en LUDEBRA Labs. Ábrelos en una pestaña nueva.
        </p>
      </div>

      {feedback && (
        <p className={`rounded-lg px-3 py-2 text-sm ${
          feedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          {feedback.text}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {simulators.map((sim) => (
            <article
              key={sim.idSimulador}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-slate-900">{sim.name}</h2>
                  <p className="mt-0.5 text-xs text-slate-400">ID {sim.idSimulador}</p>
                </div>
                <span className="material-symbols-outlined text-3xl text-sky-700">
                  science
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-4 px-5 py-4">
                <p className="text-sm leading-relaxed text-slate-600">
                  {sim.description || 'Sin descripción disponible.'}
                </p>

                <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    sim.status ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      sim.status ? 'bg-green-600' : 'bg-slate-400'
                    }`} />
                    {sim.status ? 'Activo' : 'Inactivo'}
                  </span>

                  {sim.url ? (
                    <a
                      href={sim.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800"
                    >
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                      Abrir simulador
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">Sin URL configurada</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}