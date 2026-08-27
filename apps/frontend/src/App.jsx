import { Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import { CourseFormPage, CursosList } from "./cursos";
import { Icon } from "./modules/evaluation/components/Icons";
import { StudentEvaluationPage } from "./modules/evaluation/StudentEvaluationPage";
import { TeacherEvaluationPage } from "./modules/evaluation/TeacherEvaluationPage";

function AdminLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-bright">
      <Sidebar />
      <main className="ml-0 h-full flex-1 overflow-y-auto md:ml-[260px]">
        {children}
      </main>
    </div>
  );
}

function EvaluationLayout() {
  return (
    <div className="evaluation-shell min-h-screen bg-[#f7fafc] text-[#181c1e]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#06222b] text-white shadow-[0_6px_24px_rgba(6,34,43,0.12)]">
        <div className="mx-auto flex min-h-20 max-w-[1440px] flex-wrap items-center gap-x-8 gap-y-3 px-4 py-4 sm:px-6 lg:px-10">
          <div className="mr-auto flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#38c2ff]/30 bg-[#1e3741] text-[#38c2ff]">
              <Icon className="h-6 w-6" name="flask" />
            </span>
            <div>
              <p className="evaluation-font-display text-lg font-bold tracking-tight">
                LUDEBRA LABS
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#86a0ac]">
                Virtual Laboratory
              </p>
            </div>
          </div>

          <nav
            aria-label="Navegación principal"
            className="order-3 flex w-full items-center gap-1 overflow-x-auto border-t border-white/10 pt-3 md:order-none md:w-auto md:border-0 md:pt-0"
          >
            <span className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-[#b0cbd7]">
              Mis cursos
            </span>
            <span className="whitespace-nowrap rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white">
              Calificaciones
            </span>
            <span className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-[#b0cbd7]">
              Simuladores
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">Evaluación</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#86a0ac]">
                Módulo 4
              </p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#38c2ff]/60 bg-[#1e3741] font-mono text-xs font-semibold text-[#c4e7ff]">
              M4
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <Routes>
          <Route
            element={<Navigate replace to="/evaluacion/docente/actividades" />}
            index
          />
          <Route element={<StudentEvaluationPage />} path="estudiante" />
          <Route element={<TeacherEvaluationPage />} path="docente/*" />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<Navigate replace to="/admin/cursos" />} path="/" />

      <Route
        element={
          <AdminLayout>
            <CursosList />
          </AdminLayout>
        }
        path="/admin/cursos"
      />
      <Route
        element={
          <AdminLayout>
            <CourseFormPage />
          </AdminLayout>
        }
        path="/admin/cursos/nuevo"
      />
      <Route
        element={
          <AdminLayout>
            <CourseFormPage />
          </AdminLayout>
        }
        path="/admin/cursos/:id/editar"
      />

      <Route element={<EvaluationLayout />} path="/evaluacion/*" />
      <Route element={<Navigate replace to="/admin/cursos" />} path="*" />
    </Routes>
  );
}

export default App;
