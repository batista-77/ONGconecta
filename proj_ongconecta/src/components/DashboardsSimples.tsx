import { useEffect, useMemo, useState } from "react";
import { api, type EntradaEstoqueApi, type ItemApi, type KitApi, type ResumoDashboardApi } from "../lib/api";
import { KpiCard, ModulePage, PageHeader, StatusBadge, GRADIENT } from "./ModulePrimitives";

export default function DashboardsSimples() {
  const [resumo, setResumo] = useState<ResumoDashboardApi | null>(null);
  const [itens, setItens] = useState<ItemApi[]>([]);
  const [entradas, setEntradas] = useState<EntradaEstoqueApi[]>([]);
  const [kits, setKits] = useState<KitApi[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([api.resumoDashboard(), api.listarItens(), api.listarEntradas(), api.listarKits()])
      .then(([resumoApi, itensApi, entradasApi, kitsApi]) => {
        setResumo(resumoApi);
        setItens(itensApi);
        setEntradas(entradasApi);
        setKits(kitsApi);
      })
      .catch((error) => setErro(error instanceof Error ? error.message : "Erro ao carregar dashboard."));
  }, []);

  const estoqueAtual = useMemo(() => itens.reduce((soma, item) => soma + item.quantidade_atual, 0), [itens]);
  const kitsPendentes = kits.filter((kit) => kit.status === "pendente").length;
  const categorias = useMemo(() => {
    const total = Math.max(1, estoqueAtual);
    const mapa = new Map<string, number>();
    itens.forEach((item) => mapa.set(item.categoria || "Sem categoria", (mapa.get(item.categoria || "Sem categoria") ?? 0) + item.quantidade_atual));
    return Array.from(mapa.entries()).map(([label, valor]) => ({ label, valor, pct: Math.round((valor / total) * 100) }));
  }, [itens, estoqueAtual]);

  const indicadores = [
    { label: "Estoque", valor: estoqueAtual, meta: Math.max(estoqueAtual, 100) },
    { label: "Doacoes", valor: entradas.length, meta: Math.max(entradas.length, 10) },
    { label: "Kits", valor: kits.length, meta: Math.max(kits.length, 10) },
    { label: "Entregas", valor: resumo?.total_entregas ?? 0, meta: Math.max(resumo?.total_entregas ?? 0, 10) },
  ];

  return (
    <ModulePage>
      <PageHeader icon="📊" title="Dashboards Simples" description="Indicadores calculados com dados reais do banco." />

      {erro ? <p className="font-dm text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-6">{erro}</p> : null}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Estoque atual" value={estoqueAtual} sub="unidades disponiveis" destaque />
        <KpiCard label="Doacoes" value={entradas.length} sub="entradas registradas" />
        <KpiCard label="Kits montados" value={kits.length} sub="preparados ou entregues" />
        <KpiCard label="Alertas" value={(resumo?.itens_estoque_baixo.length ?? 0) + (resumo?.itens_vencendo.length ?? 0)} sub="estoque e validade" alerta />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-6">
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="font-lora text-base font-bold text-[#134E4A]">Visao operacional</p>
            <StatusBadge>Atualizado agora</StatusBadge>
          </div>

          <div className="grid gap-5">
            {indicadores.map((item) => {
              const pct = Math.min(100, Math.round((item.valor / item.meta) * 100));
              return (
                <div key={item.label}>
                  <div className="flex justify-between mb-2">
                    <p className="font-dm text-sm font-semibold text-gray-700">{item.label}</p>
                    <p className="font-dm text-xs text-gray-400">{pct}% da referencia</p>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: GRADIENT }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="font-lora text-base font-bold text-[#134E4A] mb-6">Distribuicao por categoria</p>
          <div className="grid gap-4">
            {categorias.length === 0 ? (
              <p className="font-dm text-sm text-gray-400">Sem itens cadastrados.</p>
            ) : categorias.map((item) => (
              <div key={item.label} className="grid grid-cols-[110px_1fr_48px] items-center gap-3">
                <p className="font-dm text-xs font-semibold text-gray-500">{item.label}</p>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#2DD4BF]" style={{ width: `${item.pct}%` }} />
                </div>
                <p className="font-dm text-xs font-bold text-[#134E4A] text-right">{item.pct}%</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
        <p className="font-lora text-base font-bold text-[#134E4A] mb-4">Resumo rapido</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-[#F0FDFA] p-4">
            <p className="font-dm text-xs font-bold uppercase text-teal-700">Estoque</p>
            <p className="font-dm text-sm text-gray-500 mt-1">{resumo?.itens_vencendo.length ?? 0} lotes proximos do vencimento.</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="font-dm text-xs font-bold uppercase text-gray-500">Kits</p>
            <p className="font-dm text-sm text-gray-500 mt-1">{kitsPendentes} kits pendentes de aprovacao.</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-4">
            <p className="font-dm text-xs font-bold uppercase text-amber-700">Entregas</p>
            <p className="font-dm text-sm text-gray-500 mt-1">{resumo?.total_beneficiarios ?? 0} beneficiarios cadastrados.</p>
          </div>
        </div>
      </section>
    </ModulePage>
  );
}
