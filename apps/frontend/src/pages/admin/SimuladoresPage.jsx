import SimuladoresCatalog from '../../modules/simuladores/SimuladoresCatalog'

export function SimuladoresPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Catálogo de simuladores</h1>
        <p className="text-slate-500">
          Simuladores disponibles en LUDEBRA Labs. Ábrelos en una pestaña nueva.
        </p>
      </div>

      <SimuladoresCatalog showStatus />
    </div>
  )
}