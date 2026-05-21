import { useEffect, useMemo, useState, type FormEvent } from "react";
import { api, type CategoriaApi, type DoadorApi, type EntradaEstoqueApi, type ItemApi } from "../lib/api";
import { Field, inputCls, KpiCard, ModulePage, PageHeader, PrimaryButton, StatusBadge, Toast } from "./ModulePrimitives";

function diasAte(validade: string) {
  return Math.ceil((new Date(`${validade}T00:00:00`).getTime() - Date.now()) / 86_400_000);
}

function statusValidade(validade: string) {
  const dias = diasAte(validade);
  if (dias < 0) return { label: "Vencido", tone: "red" as const };
  if (dias <= 30) return { label: "Atencao", tone: "amber" as const };
  return { label: "Em dia", tone: "teal" as const };
}

export default function RegistroDoacoes() {
  const [entradas, setEntradas] = useState<EntradaEstoqueApi[]>([]);
  const [itens, setItens] = useState<ItemApi[]>([]);
  const [categorias, setCategorias] = useState<CategoriaApi[]>([]);
  const [doadores, setDoadores] = useState<DoadorApi[]>([]);
  const [busca, setBusca] = useState("");
  const [toast, setToast] = useState({ visivel: false, msg: "" });
  const [form, setForm] = useState({
    item_nome: "",
    categoria_id: 0,
    doador_nome: "",
    lote: "",
    validade: "",
    quantidade: 1,
    observacoes: "",
  });

  async function carregarDados() {
    const [entradasApi, itensApi, categoriasApi, doadoresApi] = await Promise.all([
      api.listarEntradas(),
      api.listarItens(),
      api.listarCategorias(),
      api.listarDoadores(),
    ]);
    setEntradas(entradasApi);
    setItens(itensApi);
    setCategorias(categoriasApi);
    setDoadores(doadoresApi);
    setForm((atual) => ({ ...atual, categoria_id: atual.categoria_id || categoriasApi[0]?.id || 0 }));
  }

  useEffect(() => {
    carregarDados().catch((erro) => mostrarToast(erro.message));
  }, []);

  const filtradas = useMemo(() => {
    const q = busca.toLowerCase();
    return entradas.filter((entrada) =>
      !q ||
      (entrada.item ?? "").toLowerCase().includes(q) ||
      entrada.lote.toLowerCase().includes(q) ||
      (entrada.doador ?? "").toLowerCase().includes(q),
    );
  }, [busca, entradas]);

  const total = useMemo(() => entradas.reduce((soma, entrada) => soma + entrada.quantidade, 0), [entradas]);
  const alertas = useMemo(() => entradas.filter((entrada) => statusValidade(entrada.validade).tone !== "teal").length, [entradas]);

  function mostrarToast(msg: string) {
    setToast({ visivel: true, msg });
    setTimeout(() => setToast({ visivel: false, msg: "" }), 2500);
  }

  async function buscarOuCriarDoador(nome: string) {
    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) return undefined;
    const existente = doadores.find((doador) => doador.nome.toLowerCase() === nomeNormalizado.toLowerCase());
    if (existente) return existente.id;
    const novo = await api.criarDoador({ nome: nomeNormalizado });
    setDoadores((prev) => [...prev, novo]);
    return novo.id;
  }

  async function buscarOuCriarItem() {
    const nome = form.item_nome.trim();
    const existente = itens.find((item) => item.nome.toLowerCase() === nome.toLowerCase());
    if (existente) return existente.id;
    const novo = await api.criarItem({
      nome,
      descricao: form.observacoes,
      unidade_medida: "unidade",
      estoque_minimo: 0,
      categoria_id: form.categoria_id,
    });
    setItens((prev) => [...prev, novo]);
    return novo.id;
  }

  async function salvar(event: FormEvent) {
    event.preventDefault();
    if (!form.item_nome || !form.lote || !form.validade || form.quantidade <= 0 || !form.categoria_id) return;

    try {
      const doadorId = await buscarOuCriarDoador(form.doador_nome);
      const itemId = await buscarOuCriarItem();
      await api.criarEntrada({
        item_id: itemId,
        doador_id: doadorId,
        lote: form.lote,
        validade: form.validade,
        quantidade: form.quantidade,
      });
      await carregarDados();
      setForm({ item_nome: "", categoria_id: categorias[0]?.id || 0, doador_nome: "", lote: "", validade: "", quantidade: 1, observacoes: "" });
      mostrarToast("Doacao registrada no banco de dados.");
    } catch (erro) {
      mostrarToast(erro instanceof Error ? erro.message : "Erro ao registrar doacao.");
    }
  }

  return (
    <ModulePage>
      <PageHeader icon="📥" title="Registro de Doacoes" description="Entradas reais registradas no banco de dados." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Doacoes" value={entradas.length} sub="entradas registradas" />
        <KpiCard label="Itens recebidos" value={total} sub="unidades cadastradas" destaque />
        <KpiCard label="Alertas" value={alertas} sub="validade sensivel" alerta={alertas > 0} />
        <KpiCard label="Doadores" value={doadores.length} sub="origens cadastradas" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-6">
        <form onSubmit={salvar} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid gap-3">
          <p className="font-lora text-base font-bold text-[#134E4A]">Nova doacao</p>
          <Field label="Item recebido">
            <input className={inputCls} value={form.item_nome} onChange={(e) => setForm({ ...form, item_nome: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoria">
              <select className={inputCls} value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: Number(e.target.value) })}>
                {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}
              </select>
            </Field>
            <Field label="Quantidade">
              <input className={inputCls} type="number" min={1} value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Doador">
              <input className={inputCls} value={form.doador_nome} onChange={(e) => setForm({ ...form, doador_nome: e.target.value })} />
            </Field>
            <Field label="Lote">
              <input className={inputCls} value={form.lote} onChange={(e) => setForm({ ...form, lote: e.target.value })} />
            </Field>
          </div>
          <Field label="Validade">
            <input className={inputCls} type="date" value={form.validade} onChange={(e) => setForm({ ...form, validade: e.target.value })} />
          </Field>
          <Field label="Observacoes">
            <textarea className={`${inputCls} min-h-24`} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
          </Field>
          <PrimaryButton type="submit">Cadastrar doacao</PrimaryButton>
        </form>

        <div>
          <input className={`${inputCls} w-full mb-5`} placeholder="Buscar por item, lote ou doador..." value={busca} onChange={(e) => setBusca(e.target.value)} />
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between">
              <p className="font-lora text-base font-bold text-[#134E4A]">Historico de Doacoes</p>
              <p className="font-dm text-xs text-gray-400">{filtradas.length} registros</p>
            </div>
            <div className="divide-y divide-gray-100">
              {filtradas.length === 0 ? (
                <p className="font-dm text-sm text-gray-400 text-center py-12">Nenhuma doacao encontrada.</p>
              ) : filtradas.map((entrada) => {
                const status = statusValidade(entrada.validade);
                return (
                  <div key={entrada.id} className="p-5 hover:bg-[#F0FDFA] transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <p className="font-dm text-sm font-semibold text-gray-900">{entrada.item}</p>
                        <p className="font-dm text-xs text-gray-400 mt-0.5">
                          Lote {entrada.lote} · {entrada.quantidade} recebidos · {entrada.quantidade_disponivel} disponiveis
                        </p>
                        <p className="font-dm text-xs text-gray-500 mt-2">{entrada.doador || "Doador nao informado"} · validade {entrada.validade}</p>
                      </div>
                      <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
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
