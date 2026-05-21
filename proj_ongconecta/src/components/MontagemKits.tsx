import { useEffect, useMemo, useState, type FormEvent } from "react";
import { api, type ItemApi, type KitApi } from "../lib/api";
import { Field, inputCls, KpiCard, ModulePage, PageHeader, PrimaryButton, StatusBadge, Toast } from "./ModulePrimitives";

function statusTone(status: KitApi["status"]) {
  if (status === "entregue") return "teal" as const;
  if (status === "aprovado") return "blue" as const;
  return "amber" as const;
}

export default function MontagemKits() {
  const [itens, setItens] = useState<ItemApi[]>([]);
  const [kits, setKits] = useState<KitApi[]>([]);
  const [nome, setNome] = useState("Kit basico");
  const [descricao, setDescricao] = useState("Familia prioritaria");
  const [selecionados, setSelecionados] = useState<Record<number, number>>({});
  const [toast, setToast] = useState({ visivel: false, msg: "" });

  async function carregarDados() {
    const [itensApi, kitsApi] = await Promise.all([api.listarItens(), api.listarKits()]);
    setItens(itensApi);
    setKits(kitsApi);
  }

  useEffect(() => {
    carregarDados().catch((erro) => mostrarToast(erro.message));
  }, []);

  const itensSelecionados = useMemo(
    () => itens.filter((item) => (selecionados[item.id] ?? 0) > 0),
    [itens, selecionados],
  );
  const totalItensUsados = kits.reduce((soma, kit) => soma + kit.itens.reduce((a, item) => a + item.quantidade, 0), 0);

  function mostrarToast(msg: string) {
    setToast({ visivel: true, msg });
    setTimeout(() => setToast({ visivel: false, msg: "" }), 2500);
  }

  async function criarKit(event: FormEvent) {
    event.preventDefault();
    if (!itensSelecionados.length) {
      mostrarToast("Selecione ao menos um item.");
      return;
    }

    try {
      const kit = await api.criarKit({ nome, descricao });
      for (const item of itensSelecionados) {
        await api.adicionarItemKit(kit.id, { item_id: item.id, quantidade: selecionados[item.id] ?? 0 });
      }
      setSelecionados({});
      await carregarDados();
      mostrarToast("Kit criado no banco de dados.");
    } catch (erro) {
      mostrarToast(erro instanceof Error ? erro.message : "Erro ao criar kit.");
    }
  }

  async function aprovarKit(kitId: number) {
    try {
      await api.aprovarKit(kitId);
      await carregarDados();
      mostrarToast("Kit aprovado e estoque baixado.");
    } catch (erro) {
      mostrarToast(erro instanceof Error ? erro.message : "Erro ao aprovar kit.");
    }
  }

  return (
    <ModulePage>
      <PageHeader icon="🎁" title="Montagem de Kits" description="Selecao de itens reais do estoque e aprovacao com baixa automatica." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Kits montados" value={kits.length} sub="historico registrado" />
        <KpiCard label="Itens usados" value={totalItensUsados} sub="itens em kits" destaque />
        <KpiCard label="Itens disponiveis" value={itens.reduce((s, i) => s + i.quantidade_atual, 0)} sub="saldo real" />
        <KpiCard label="Itens no kit" value={itensSelecionados.length} sub="selecao atual" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
        <form onSubmit={criarKit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid gap-4">
          <p className="font-lora text-base font-bold text-[#134E4A]">Novo kit</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Nome do kit">
              <input className={inputCls} value={nome} onChange={(e) => setNome(e.target.value)} />
            </Field>
            <Field label="Descricao">
              <input className={inputCls} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </Field>
          </div>

          <div className="grid gap-3">
            {itens.length === 0 ? (
              <p className="font-dm text-sm text-gray-400">Cadastre entradas de estoque antes de montar kits.</p>
            ) : itens.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_120px] gap-3 items-center border border-gray-100 rounded-xl p-3">
                <div>
                  <p className="font-dm text-sm font-semibold text-gray-900">{item.nome}</p>
                  <p className="font-dm text-xs text-gray-400">{item.categoria} · saldo {item.quantidade_atual}</p>
                </div>
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  max={item.quantidade_atual}
                  value={selecionados[item.id] ?? 0}
                  onChange={(e) => setSelecionados({ ...selecionados, [item.id]: Number(e.target.value) })}
                />
              </div>
            ))}
          </div>
          <PrimaryButton type="submit">Criar kit</PrimaryButton>
        </form>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between">
            <p className="font-lora text-base font-bold text-[#134E4A]">Historico de Kits</p>
            <p className="font-dm text-xs text-gray-400">{kits.length} kits</p>
          </div>
          <div className="divide-y divide-gray-100">
            {kits.length === 0 ? (
              <p className="font-dm text-sm text-gray-400 text-center py-12">Nenhum kit criado.</p>
            ) : kits.map((kit) => (
              <div key={kit.id} className="p-5 hover:bg-[#F0FDFA] transition-colors">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <p className="font-dm text-sm font-semibold text-gray-900">{kit.nome}</p>
                    <p className="font-dm text-xs text-gray-400">{kit.descricao || "Sem descricao"}</p>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge tone={statusTone(kit.status)}>{kit.status}</StatusBadge>
                    {kit.status === "pendente" ? (
                      <button className="font-dm text-xs font-semibold px-3 py-1.5 rounded-full border-2 border-gray-200 bg-white text-gray-500 hover:border-[#2DD4BF]" onClick={() => aprovarKit(kit.id)}>
                        Aprovar
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-2 mt-4">
                  {kit.itens.map((item) => (
                    <div key={`${kit.id}-${item.id}`} className="rounded-xl bg-gray-50 px-3 py-2 font-dm text-xs text-gray-500">
                      {item.quantidade}x {item.item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Toast visivel={toast.visivel} msg={toast.msg} />
    </ModulePage>
  );
}
