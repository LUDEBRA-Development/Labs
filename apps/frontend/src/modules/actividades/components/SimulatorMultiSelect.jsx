import { useEffect, useState } from 'react';
import { simulatorsApi } from '../api/simulatorApi';

export default function SimulatorMultiSelect({ selectedIds, onChange }) {
  const [simulators, setSimulators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    simulatorsApi.findAll(true).then((data) => {
      setSimulators(data);
      setLoading(false);
    });
  }, []);

  const toggle = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Cargando simuladores...</p>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {simulators.map((sim) => {
        const isSelected = selectedIds.includes(sim.idSimulador);
        return (
          <button
            type="button"
            key={sim.idSimulador}
            onClick={() => toggle(sim.idSimulador)}
            className={`flex flex-col items-center justify-center rounded-lg border p-4 text-center transition
              ${isSelected
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                : 'border-gray-200 hover:border-gray-300'}`}
          >
            <span className="text-3xl mb-2">🧪</span>
            <span className="font-medium text-gray-800">{sim.name}</span>
            {sim.description && (
              <span className="text-xs text-gray-500 mt-1">{sim.description}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}