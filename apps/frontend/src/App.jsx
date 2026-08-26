import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { StudentEvaluationPage } from "./modules/evaluation/StudentEvaluationPage";
import { TeacherEvaluationPage } from "./modules/evaluation/TeacherEvaluationPage";

const navigation = [
  { to: "/evaluacion/estudiante", label: "Vista del estudiante" },
  { to: "/evaluacion/docente", label: "Vista del docente" },
];

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Ludebra Labs
            </p>
            <p className="mt-1 text-xl font-bold text-slate-950">
              Evaluación y seguimiento
            </p>
          </div>

          <nav
            aria-label="Navegación del módulo de evaluación"
            className="flex flex-wrap gap-2"
          >
            {navigation.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  `rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`
                }
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-12">
        <Routes>
          <Route
            element={<Navigate replace to="/evaluacion/estudiante" />}
            path="/"
          />
          <Route
            element={<StudentEvaluationPage />}
            path="/evaluacion/estudiante"
          />
          <Route
            element={<TeacherEvaluationPage />}
            path="/evaluacion/docente"
          />
          <Route
            element={<Navigate replace to="/evaluacion/estudiante" />}
            path="*"
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
