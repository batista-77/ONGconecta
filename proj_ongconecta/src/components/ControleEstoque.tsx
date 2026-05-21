import { useEffect, useMemo, useState } from "react";
import { api, type EntradaEstoqueApi } from "../lib/api";
import { inputCls, KpiCard, ModulePage, PageHeader, PrimaryButton, StatusBadge, Toast } from "./ModulePrimitives";

type OrdemPor = "validade" | "quantidade" | "nome";

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function statusValidade(validade: string) {
  const dias = Math.ceil((new Date(`${validade}T00:00:00`).getTime() - Date.now()) / 86_400_000);
  if (dias < 0) return { label: "Vencido", tone: "red" as const };
  if (dias <= 30) return { label: "Atencao", tone: "amber" as const };
  return { label: "Em dia", tone: "teal" as const };
}

export default function ControleEstoque() {
  const [entradas, setEntradas] = useState<EntradaEstoqueApi[]>([]);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<OrdemPor>("validade");
  const [toast, setToast] = useState({ visivel: false, msg: "" });

  async function carregarEntradas() {
    setEntradas(await api.listarEntradas());
  }

  useEffect(() => {
    carregarEntradas().catch((erro) => mostrarToast(erro.message));
  }, []);

  const totalItens = useMemo(() => entradas.reduce((soma, entrada) => soma + entrada.quantidade_disponivel, 0), [entradas]);
  const alertas = useMemo(() => entradas.filter((entrada) => statusValidade(entrada.validade).tone === "amber").length, [entradas]);
  const vencidos = useMemo(() => entradas.filter((entrada) => statusValidade(entrada.validade).tone === "red").length, [entradas]);

  const entradasFiltradas = useMemo(() => {
    const q = busca.toLowerCase();
    return entradas
      .filter((entrada) =>
        !q ||
        (entrada.item ?? "").toLowerCase().includes(q) ||
        entrada.lote.toLowerCase().includes(q) ||
        (entrada.doador ?? "").toLowerCase().includes(q),
      )
      .sort((a, b) => {
        if (ordem === "validade") return a.validade.localeCompare(b.validade);
        if (ordem === "quantidade") return b.quantidade_disponivel - a.quantidade_disponivel;
        return (a.item ?? "").localeCompare(b.item ?? "");
      });
  }, [entradas, busca, ordem]);

  function mostrarToast(msg: string) {
    setToast({ visivel: true, msg });
    setTimeout(() => setToast({ visivel: false, msg: "" }), 3000);
  }

  function exportarAuditoria() {
    const cabecalho = ["Item", "Lote", "Doador", "Validade", "Quantidade", "Disponivel"];
    const linhas = entradas.map((entrada) =>
      [entrada.item, entrada.lote, entrada.doador ?? "", formatarData(entrada.validade), entrada.quantidade, entrada.quantidade_disponivel].join(","),
    );
    const blob = new Blob([[cabecalho.join(","), ...linhas].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ongconecta-estoque-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    mostrarToast("Relatorio exportado.");
  }

  return (
    <ModulePage>
      <PageHeader
        icon="📦"
        title="Controle de Estoque"
        description="Lotes, validade e saldos reais vindos do banco de dados."
        actions={<PrimaryButton onClick={exportarAuditoria}>Exportar auditoria</PrimaryButton>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Estoque Atual" value={totalItens.toLocaleString("pt-BR")} sub="unidades disponiveis" destaque />
        <KpiCard label="Lotes" value={entradas.length} sub="entradas registradas" />
        <KpiCard label="Alertas" value={alertas} sub="itens proximos do vencimento" alerta={alertas > 0} />
        <KpiCard label="Vencidos" value={vencidos} sub="requer acao imediata" alerta={vencidos > 0} />
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-5">
        <input className={`${inputCls} flex-1 min-w-[220px]`} placeholder="Buscar item, lote ou doador..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        <select className={inputCls} value={ordem} onChange={(e) => setOrdem(e.target.value as OrdemPor)}>
          <option value="validade">Ordenar: Validade</option>
          <option value="quantidade">Ordenar: Quantidade</option>
          <option value="nome">Ordenar: Nome A-Z</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="font-lora text-base font-bold text-[#134E4A]">Inventario de Lotes</p>
          <p className="font-dm text-xs text-gray-400">{entradasFiltradas.length} de {entradas.length} lotes</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Item", "Lote", "Doador", "Validade", "Recebido", "Disponivel", "Status"].map((titulo) => (
                  <th key={titulo} className="text-left font-dm text-[11px] font-bold uppercase tracking-widest text-gray-400 px-5 py-3">
                    {titulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entradasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center font-dm text-sm text-gray-400 py-12">Nenhum lote encontrado.</td>
                </tr>
              ) : entradasFiltradas.map((entrada) => {
                const status = statusValidade(entrada.validade);
                return (
                  <tr key={entrada.id} className="border-b border-gray-100 hover:bg-[#F0FDFA] transition-colors">
                    <td className="px-5 py-3.5 font-dm text-sm font-semibold text-gray-900">{entrada.item}</td>
                    <td className="px-5 py-3.5"><span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{entrada.lote}</span></td>
                    <td className="px-5 py-3.5 font-dm text-xs text-gray-500">{entrada.doador || "Nao informado"}</td>
                    <td className="px-5 py-3.5 font-dm text-sm text-gray-600">{formatarData(entrada.validade)}</td>
                    <td className="px-5 py-3.5 font-dm text-sm text-gray-600">{entrada.quantidade}</td>
                    <td className="px-5 py-3.5 font-dm text-sm font-bold text-[#134E4A]">{entrada.quantidade_disponivel}</td>
                    <td className="px-5 py-3.5"><StatusBadge tone={status.tone}>{status.label}</StatusBadge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Toast visivel={toast.visivel} msg={toast.msg} />
    </ModulePage>
  );
}
