import type { ReactNode } from "react";

export const TEAL = "#2DD4BF";
export const TEAL_DARK = "#0D9488";
export const PETROL = "#134E4A";
export const GRADIENT = `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`;
export const SHADOW_TEAL = "0 4px 18px rgba(45,212,191,0.35)";

export function PageHeader({
  icon,
  title,
  description,
  actions,
}: {
  icon: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
      <div>
        <h1 className="font-lora text-2xl md:text-3xl font-extrabold text-[#134E4A] tracking-tight">
          {icon} {title}
        </h1>
        <p className="font-dm text-sm text-gray-400 mt-1">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function ModulePage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAF9] font-dm">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-10 pb-10">{children}</div>
    </div>
  );
}

export function KpiCard({
  label,
  value,
  sub,
  destaque,
  alerta,
}: {
  label: string;
  value: string | number;
  sub: string;
  destaque?: boolean;
  alerta?: boolean;
}) {
  const bg = destaque ? GRADIENT : alerta ? "#FEF2F2" : "#FFFFFF";
  const clVal = destaque ? "text-white" : alerta ? "text-red-500" : "text-[#134E4A]";
  const clLbl = destaque ? "text-white/80" : "text-gray-400";
  const clSub = destaque ? "text-white/70" : alerta ? "text-red-400" : "text-gray-400";

  return (
    <div
      className="rounded-2xl p-5 border border-gray-100 transition-shadow hover:shadow-md"
      style={{ background: bg, boxShadow: destaque ? SHADOW_TEAL : "0 2px 8px rgba(0,0,0,0.06)" }}
    >
      <p className={`font-dm text-[11px] font-bold tracking-widest uppercase mb-2 ${clLbl}`}>{label}</p>
      <p className={`font-lora text-[2rem] font-bold leading-none ${clVal}`}>{value}</p>
      <p className={`font-dm text-xs mt-1.5 ${clSub}`}>{sub}</p>
    </div>
  );
}

export function Toast({ msg, visivel }: { msg: string; visivel: boolean }) {
  if (!visivel) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl font-dm text-sm font-semibold text-white animate-[fadeInUp_0.3s_ease]"
      style={{ background: PETROL }}
    >
      {msg}
    </div>
  );
}

export function StatusBadge({ children, tone = "teal" }: { children: ReactNode; tone?: "teal" | "amber" | "red" | "gray" | "blue" }) {
  const cls = {
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-600",
    gray: "bg-gray-100 text-gray-500",
    blue: "bg-sky-50 text-sky-700",
  }[tone];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-dm tracking-wide ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function PrimaryButton({ children, onClick, type = "button" }: { children: ReactNode; onClick?: () => void; type?: "button" | "submit" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="flex items-center gap-2 font-dm text-sm font-bold text-[#134E4A] px-5 py-2.5 rounded-full border-none cursor-pointer transition-all hover:-translate-y-0.5"
      style={{ background: GRADIENT, boxShadow: SHADOW_TEAL }}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-dm text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "border border-gray-200 rounded-xl px-3 py-2.5 font-dm text-sm focus:outline-none focus:border-[#2DD4BF] transition-colors bg-white";
