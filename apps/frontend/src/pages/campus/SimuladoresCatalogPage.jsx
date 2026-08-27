import SimuladoresCatalog from '../../modules/simuladores/SimuladoresCatalog'

export function SimuladoresCatalogPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-slate-500">Página principal › Simuladores</p>
        <h1 className="text-2xl font-bold text-slate-800">Catálogo de simuladores</h1>
        <p className="text-slate-500">
          Simuladores disponibles para tus actividades. Ábrelos en una pestaña nueva.
        </p>
      </div>

      <SimuladoresCatalog onlyActive />
    </div>
  )
}