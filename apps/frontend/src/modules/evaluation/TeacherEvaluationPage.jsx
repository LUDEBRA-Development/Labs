import { Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { EvaluateDeliveryPage } from "./teacher/EvaluateDeliveryPage";
import { TaskDeliveriesPage } from "./teacher/TaskDeliveriesPage";
import { TeacherActivitiesPage } from "./teacher/TeacherActivitiesPage";

export function TeacherEvaluationPage() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const initials = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="evaluation-shell min-h-screen bg-[#f7fafc] text-[#181c1e]">
      <header className="sticky top-0 z-40 border-b border-[#c2c7cb]/60 bg-[#06222b] text-white shadow-sm">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-5 px-4 sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-8">
            <NavLink className="shrink-0" to="/docente">
              <span className="evaluation-font-display block text-xl font-bold tracking-tight">
                LUDEBRA LABS
              </span>
              <span className="block text-[9px] uppercase tracking-[0.16em] text-[#86a0ac]">
                Virtual Laboratory
              </span>
            </NavLink>
            <nav className="hidden items-center gap-6 md:flex">
              <NavLink className="font-mono text-sm text-[#b0cbd7] transition hover:text-[#38c2ff]" to="/docente">
                Mis Cursos
              </NavLink>
              <NavLink className="border-b-2 border-[#38c2ff] pb-1 font-mono text-sm text-white" to="/evaluacion/docente">
                Calificaciones
              </NavLink>
              <span className="cursor-not-allowed font-mono text-sm text-[#86a0ac]" title="Módulo en construcción">
                Simuladores
              </span>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              aria-label="Cerrar sesión"
              className="hidden rounded-lg px-3 py-2 text-sm text-[#b0cbd7] transition hover:bg-white/10 hover:text-white sm:block"
              onClick={handleLogout}
              type="button"
            >
              Cerrar sesión
            </button>
            <div className="hidden border-l border-white/15 pl-4 text-right sm:block">
              <p className="text-sm font-medium">
                {[profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "Docente"}
              </p>
              <p className="text-xs text-[#86a0ac]">Docente</p>
            </div>
            {profile?.profilePicture ? (
              <img alt="" className="h-10 w-10 rounded-full border-2 border-[#38c2ff] object-cover" src={profile.profilePicture} />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#38c2ff] bg-[#1e3741] font-mono text-xs font-semibold">
                {initials || "DO"}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
        <Routes>
          <Route element={<Navigate replace to="actividades" />} index />
          <Route element={<TeacherActivitiesPage />} path="actividades" />
          <Route element={<TaskDeliveriesPage />} path="actividades/:idTask/entregas" />
          <Route element={<EvaluateDeliveryPage />} path="actividades/:idTask/entregas/:emailUser" />
          <Route element={<Navigate replace to="actividades" />} path="*" />
        </Routes>
      </main>
    </div>
  );
}
