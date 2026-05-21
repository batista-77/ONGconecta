import { useEffect, useMemo, useState, type FormEvent } from "react";
import { api, type BeneficiarioApi, type EntregaApi, type KitApi } from "../lib/api";
import { Field, inputCls, KpiCard, ModulePage, PageHeader, PrimaryButton, StatusBadge, Toast } from "./ModulePrimitives";

function prioridadeTone(prioridade: string) {
  if (prioridade === "alta") return "red" as const;
  if (prioridade === "media") return "amber" as const;
  return "teal" as const;
}

export default function RegistroEntregas() {
  const [entregas, setEntregas] = useState<EntregaApi[]>([]);
  const [beneficiarios, setBeneficiarios] = useState<BeneficiarioApi[]>([]);
  const [kits, setKits] = useState<KitApi[]>([]);
  const [busca, setBusca] = useState("");
  const [toast, setToast] = useState({ visivel: false, msg: "" });
  const [form, setForm] = useState({
    kit_id: 0,
    beneficiario_id: 0,
    data_entrega: new Date().toISOString().slice(0, 10),
    observacao: "",
    novo_nome: "",
    prioridade: "media",
    quantidade_pessoas_familia: 1,
  });

  async function carregarDados() {
    const [entregasApi, beneficiariosApi, kitsApi] = await Promise.all([
      api.listarEntregas(),
      api.listarBeneficiarios(),
      api.listarKits(),
    ]);
    setEntregas(entregasApi);
    setBeneficiarios(beneficiariosApi);
    setKits(kitsApi);
    const kitDisponivel = kitsApi.find((kit) => kit.status === "aprovado");
    setForm((atual) => ({
      ...atual,
      kit_id: atual.kit_id || kitDisponivel?.id || 0,
      beneficiario_id: atual.beneficiario_id || beneficiariosApi[0]?.id || 0,
    }));
  }

  useEffect(() => {
    carregarDados().catch((erro) => mostrarToast(erro.message));
  }, []);

  const filtradas = useMemo(() => {
    const q = busca.toLowerCase();
    return entregas.filter((entrega) => !q || (entrega.beneficiario ?? "").toLowerCase().includes(q) || (entrega.observacao ?? "").toLowerCase().includes(q));
  }, [busca, entregas]);

  const beneficiariosAlta = beneficiarios.filter((beneficiario) => beneficiario.prioridade === "alta").length;
  const kitsAprovados = kits.filter((kit) => kit.status === "aprovado");

  function mostrarToast(msg: string) {
    setToast({ visivel: true, msg });
    setTimeout(() => setToast({ visivel: false, msg: "" }), 2500);
  }

  async function salvar(event: FormEvent) {
    event.preventDefault();

    try {
      let beneficiarioId = form.beneficiario_id;
      if (form.novo_nome.trim()) {
        const novo = await api.criarBeneficiario({
          nome: form.novo_nome.trim(),
          prioridade: form.prioridade,
          quantidade_pessoas_familia: form.quantidade_pessoas_familia,
        });
        beneficiarioId = novo.id;
      }

      if (!form.kit_id || !beneficiarioId) {
        mostrarToast("Selecione um kit aprovado e um beneficiario.");
        return;
      }

      await api.criarEntrega({
        kit_id: form.kit_id,
        beneficiario_id: beneficiarioId,
        data_entrega: form.data_entrega,
        observacao: form.observacao,
      });
      await carregarDados();
      setForm({ ...form, novo_nome: "", observacao: "", beneficiario_id: beneficiarioId });
      mostrarToast("Entrega registrada no banco de dados.");
    } catch (erro) {
      mostrarToast(erro instanceof Error ? erro.message : "Erro ao registrar entrega.");
    }
  }

  return (
    <ModulePage>
      <PageHeader icon="🚚" title="Registro de Entregas" description="Entregas reais vinculadas a kits aprovados e beneficiarios cadastrados." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Entregas" value={entregas.length} sub="registros totais" />
        <KpiCard label="Kits entregues" value={kits.filter((kit) => kit.status === "entregue").length} sub="baixa concluida" destaque />
        <KpiCard label="Alta prioridade" value={beneficiariosAlta} sub="familias criticas" alerta={beneficiariosAlta > 0} />
        <KpiCard label="Kits aprovados" value={kitsAprovados.length} sub="prontos para entrega" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-6">
        <form onSubmit={salvar} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid gap-3">
          <p className="font-lora text-base font-bold text-[#134E4A]">Nova entrega</p>
          <Field label="Kit aprovado">
            <select className={inputCls} value={form.kit_id} onChange={(e) => setForm({ ...form, kit_id: Number(e.target.value) })}>
              <option value={0}>Selecione</option>
              {kitsAprovados.map((kit) => <option key={kit.id} value={kit.id}>{kit.nome}</option>)}
            </select>
          </Field>
          <Field label="Beneficiario existente">
            <select className={inputCls} value={form.beneficiario_id} onChange={(e) => setForm({ ...form, beneficiario_id: Number(e.target.value), novo_nome: "" })}>
              <option value={0}>Cadastrar novo abaixo</option>
              {beneficiarios.map((beneficiario) => <option key={beneficiario.id} value={beneficiario.id}>{beneficiario.nome}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Novo beneficiario">
              <input className={inputCls} value={form.novo_nome} onChange={(e) => setForm({ ...form, novo_nome: e.target.value, beneficiario_id: 0 })} />
            </Field>
            <Field label="Prioridade">
              <select className={inputCls} value={form.prioridade} onChange={(e) => setForm({ ...form, prioridade: e.target.value })}>
                {["alta", "media", "baixa"].map((prioridade) => <option key={prioridade}>{prioridade}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pessoas na familia">
              <input className={inputCls} type="number" min={1} value={form.quantidade_pessoas_familia} onChange={(e) => setForm({ ...form, quantidade_pessoas_familia: Number(e.target.value) })} />
            </Field>
            <Field label="Data">
              <input className={inputCls} type="date" value={form.data_entrega} onChange={(e) => setForm({ ...form, data_entrega: e.target.value })} />
            </Field>
          </div>
          <Field label="Observacoes">
            <textarea className={`${inputCls} min-h-24`} value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} />
          </Field>
          <PrimaryButton type="submit">Cadastrar entrega</PrimaryButton>
        </form>

        <div>
          <input className={`${inputCls} w-full mb-5`} placeholder="Buscar beneficiario ou observacao..." value={busca} onChange={(e) => setBusca(e.target.value)} />
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between">
              <p className="font-lora text-base font-bold text-[#134E4A]">Historico de Entregas</p>
              <p className="font-dm text-xs text-gray-400">{filtradas.length} registros</p>
            </div>
            <div className="divide-y divide-gray-100">
              {filtradas.length === 0 ? (
                <p className="font-dm text-sm text-gray-400 text-center py-12">Nenhuma entrega registrada.</p>
              ) : filtradas.map((entrega) => {
                const beneficiario = beneficiarios.find((item) => item.id === entrega.beneficiario_id);
                return (
                  <div key={entrega.id} className="p-5 hover:bg-[#F0FDFA] transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <p className="font-dm text-sm font-semibold text-gray-900">{entrega.beneficiario}</p>
                        <p className="font-dm text-xs text-gray-400">Kit #{entrega.kit_id} · {entrega.data_entrega}</p>
                        <p className="font-dm text-xs text-gray-500 mt-2">{entrega.observacao || "Sem observacoes."}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {beneficiario ? <StatusBadge tone={prioridadeTone(beneficiario.prioridade)}>Prioridade {beneficiario.prioridade}</StatusBadge> : null}
                        <StatusBadge>Entregue</StatusBadge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Toast visivel={toast.visivel} msg={toast.msg} />
    </ModulePage>
  );
}
