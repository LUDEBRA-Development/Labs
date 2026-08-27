import { NavLink } from "react-router-dom";
import { Icon } from "./Icons";

const roleLinks = [
  { to: "/evaluacion/estudiante", label: "Vista del estudiante" },
  { to: "/evaluacion/docente", label: "Vista del docente" },
];

export function RoleSwitcher() {
  return (
    <nav
      aria-label="Cambiar perspectiva de evaluación"
      className="inline-flex rounded-xl bg-[#ebeef0] p-1"
    >
      {roleLinks.map((link) => (
        <NavLink
          className={({ isActive }) =>
            `rounded-lg px-3 py-2 font-mono text-xs font-medium transition sm:px-4 sm:text-sm ${
              isActive
                ? "bg-[#00668a] text-white shadow-[0_4px_16px_rgba(0,102,138,0.18)]"
                : "text-[#42484a] hover:bg-white/70 hover:text-[#06222b]"
            }`
          }
          key={link.to}
          to={link.to}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function Breadcrumbs({ current }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-[#72787b]">
      <span>Página principal</span>
      <span aria-hidden="true">›</span>
      <span>Calificaciones</span>
      <span aria-hidden="true">›</span>
      <span className="font-medium text-[#181c1e]">{current}</span>
    </div>
  );
}

export function StatCard({ icon, label, value, tone = "primary" }) {
  const tones = {
    primary: "stat-card-primary",
    cyan: "stat-card-cyan",
    success: "stat-card-success",
    warning: "stat-card-warning",
  };

  return (
    <article
      className={`academic-card stat-card flex min-h-28 items-center gap-4 p-5 ${tones[tone]}`}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#eaf1f4]">
        <Icon className="h-6 w-6" name={icon} />
      </span>
      <div>
        <p className="technical-label text-[#5b6265]">{label}</p>
        <p className="evaluation-font-display mt-1 text-3xl font-semibold text-[#181c1e]">
          {value}
        </p>
      </div>
    </article>
  );
}

export function StatusBadge({ qualified }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-medium ${
        qualified
          ? "bg-[#d9f3ff] text-[#004d6a]"
          : "bg-[#fff0d9] text-[#7a4d0a]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          qualified ? "bg-[#00afeb]" : "bg-[#e9a23b]"
        }`}
      />
      {qualified ? "Calificado" : "Entregado"}
    </span>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="grid min-h-52 place-items-center px-6 py-10 text-center">
      <div>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eaf1f4] text-[#00668a]">
          <Icon className="h-7 w-7" name="inbox" />
        </span>
        <h3 className="evaluation-font-display mt-4 text-lg font-semibold text-[#181c1e]">
          {title}
        </h3>
        <p className="mx-auto mt-2 max-w-[28rem] text-sm leading-6 text-[#5b6265]">
          {description}
        </p>
      </div>
    </div>
  );
}

export function Avatar({ email }) {
  const initials = email
    .split("@")[0]
    .split(/[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#d9f3ff] font-mono text-xs font-semibold text-[#004d6a]">
      {initials || "ES"}
    </span>
  );
}
