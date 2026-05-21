import { useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { api } from "../lib/api";

const GRADIENT_PRIMARY = "linear-gradient(135deg, #19c19e, #69e3a9)";

type TipoModal = "doacao" | "voluntario" | null;

export default function ChamadasPublicas() {
  const [modal, setModal] = useState<TipoModal>(null);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [doacao, setDoacao] = useState({
    nome: "",
    email: "",
    telefone: "",
    tipo_doacao: "Alimentos",
    descricao_itens: "",
    quantidade_aproximada: "",
    validade: "",
    endereco_retirada: "",
    observacao: "",
  });
  const [voluntario, setVoluntario] = useState({
    nome: "",
    email: "",
    telefone: "",
    disponibilidade: "",
    area_interesse: "Triagem de doacoes",
    mensagem: "",
  });

  function fecharModal() {
    setModal(null);
    setMensagem("");
  }

  async function enviarDoacao(event: FormEvent) {
    event.preventDefault();
    setCarregando(true);
    setMensagem("");
    try {
      await api.enviarSolicitacaoDoacao(doacao);
      setMensagem("Solicitacao enviada. A ONG vai conferir as informacoes antes de registrar no estoque.");
      setDoacao({ nome: "", email: "", telefone: "", tipo_doacao: "Alimentos", descricao_itens: "", quantidade_aproximada: "", validade: "", endereco_retirada: "", observacao: "" });
    } catch (erro) {
      setMensagem(erro instanceof Error ? erro.message : "Nao foi possivel enviar a solicitacao.");
    } finally {
      setCarregando(false);
    }
  }

  async function enviarVoluntario(event: FormEvent) {
    event.preventDefault();
    setCarregando(true);
    setMensagem("");
    try {
      await api.enviarSolicitacaoVoluntario(voluntario);
      setMensagem("Solicitacao enviada. A equipe da ONG vai avaliar seu cadastro.");
      setVoluntario({ nome: "", email: "", telefone: "", disponibilidade: "", area_interesse: "Triagem de doacoes", mensagem: "" });
    } catch (erro) {
      setMensagem(erro instanceof Error ? erro.message : "Nao foi possivel enviar a solicitacao.");
    } finally {
      setCarregando(false);
    }
  }

  const modalAberto = modal ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6" style={{ background: "rgba(26,46,37,0.55)", backdropFilter: "blur(4px)" }} onClick={(e) => e.target === e.currentTarget && fecharModal()}>
      <div className="bg-white rounded-2xl w-[560px] max-w-[95vw] max-h-[calc(100vh-48px)] shadow-2xl text-left flex flex-col overflow-hidden">
        <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-100">
          <div>
            <p className="font-lora text-xl font-bold text-[#134E4A]">{modal === "doacao" ? "Fazer uma doacao" : "Quero ser voluntario"}</p>
            <p className="font-dm text-sm text-gray-400 mt-1">
              {modal === "doacao" ? "A solicitacao entra como pendente ate a ONG conferir." : "A equipe avalia e entra em contato depois."}
            </p>
          </div>
          <button className="font-dm text-sm font-bold text-gray-400 hover:text-[#134E4A]" onClick={fecharModal}>Fechar</button>
        </div>

        <div className="overflow-y-auto p-6">
          {modal === "doacao" ? (
            <form id="form-doacao-publica" onSubmit={enviarDoacao} className="grid gap-3">
              <Campo label="Nome"><input className={inputCls} value={doacao.nome} onChange={(e) => setDoacao({ ...doacao, nome: e.target.value })} required /></Campo>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Campo label="Email"><input className={inputCls} type="email" value={doacao.email} onChange={(e) => setDoacao({ ...doacao, email: e.target.value })} /></Campo>
                <Campo label="Telefone"><input className={inputCls} value={doacao.telefone} onChange={(e) => setDoacao({ ...doacao, telefone: e.target.value })} /></Campo>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Campo label="Tipo de doacao">
                  <select className={inputCls} value={doacao.tipo_doacao} onChange={(e) => setDoacao({ ...doacao, tipo_doacao: e.target.value })}>
                    {["Alimentos", "Higiene", "Limpeza", "Vestuario", "Outros"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Campo>
                <Campo label="Quantidade aproximada"><input className={inputCls} value={doacao.quantidade_aproximada} onChange={(e) => setDoacao({ ...doacao, quantidade_aproximada: e.target.value })} /></Campo>
              </div>
              <Campo label="Descricao dos itens"><textarea className={`${inputCls} min-h-24`} value={doacao.descricao_itens} onChange={(e) => setDoacao({ ...doacao, descricao_itens: e.target.value })} required /></Campo>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Campo label="Validade"><input className={inputCls} type="date" value={doacao.validade} onChange={(e) => setDoacao({ ...doacao, validade: e.target.value })} /></Campo>
                <Campo label="Endereco para retirada"><input className={inputCls} value={doacao.endereco_retirada} onChange={(e) => setDoacao({ ...doacao, endereco_retirada: e.target.value })} /></Campo>
              </div>
              <Campo label="Observacao"><textarea className={`${inputCls} min-h-20`} value={doacao.observacao} onChange={(e) => setDoacao({ ...doacao, observacao: e.target.value })} /></Campo>
            </form>
          ) : (
            <form id="form-voluntario-publico" onSubmit={enviarVoluntario} className="grid gap-3">
              <Campo label="Nome"><input className={inputCls} value={voluntario.nome} onChange={(e) => setVoluntario({ ...voluntario, nome: e.target.value })} required /></Campo>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Campo label="Email"><input className={inputCls} type="email" value={voluntario.email} onChange={(e) => setVoluntario({ ...voluntario, email: e.target.value })} required /></Campo>
                <Campo label="Telefone"><input className={inputCls} value={voluntario.telefone} onChange={(e) => setVoluntario({ ...voluntario, telefone: e.target.value })} /></Campo>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Campo label="Disponibilidade"><input className={inputCls} value={voluntario.disponibilidade} onChange={(e) => setVoluntario({ ...voluntario, disponibilidade: e.target.value })} /></Campo>
                <Campo label="Area de interesse">
                  <select className={inputCls} value={voluntario.area_interesse} onChange={(e) => setVoluntario({ ...voluntario, area_interesse: e.target.value })}>
                    {["Triagem de doacoes", "Entregas", "Cadastro de familias", "Comunicacao", "Administrativo"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Campo>
              </div>
              <Campo label="Mensagem"><textarea className={`${inputCls} min-h-24`} value={voluntario.mensagem} onChange={(e) => setVoluntario({ ...voluntario, mensagem: e.target.value })} /></Campo>
            </form>
          )}

          {mensagem ? <p className="font-dm text-sm text-[#134E4A] bg-[#F0FDFA] rounded-xl px-4 py-3 mt-4">{mensagem}</p> : null}
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-white">
          <button type="button" className="font-dm text-sm font-semibold bg-gray-100 text-gray-600 px-5 py-2.5 rounded-full" onClick={fecharModal}>
            Sair
          </button>
          <BotaoEnviar form={modal === "doacao" ? "form-doacao-publica" : "form-voluntario-publico"} carregando={carregando}>
            {modal === "doacao" ? "Enviar solicitacao" : "Enviar cadastro"}
          </BotaoEnviar>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="flex gap-4 justify-center flex-wrap">
        <button
          className="font-dm font-semibold text-sm bg-white text-[#19c19e] px-8 py-3.5 rounded-full cursor-pointer shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.18)]"
          onClick={() => setModal("voluntario")}
        >
          Quero ser voluntario
        </button>
        <button
          className="font-dm font-semibold text-sm bg-transparent text-white border-2 border-white/60 px-8 py-3.5 rounded-full cursor-pointer transition-all hover:border-white hover:bg-white/10 hover:-translate-y-0.5"
          onClick={() => setModal("doacao")}
        >
          Fazer uma doacao
        </button>
      </div>

      {modalAberto ? createPortal(modalAberto, document.body) : null}
    </>
  );
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="font-dm text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
      {children}
    </label>
  );
}

function BotaoEnviar({ children, carregando, form }: { children: string; carregando: boolean; form: string }) {
  return (
    <button type="submit" form={form} className="font-dm text-sm font-semibold text-white px-6 py-3 rounded-full border-none cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-60" style={{ background: GRADIENT_PRIMARY }} disabled={carregando}>
      {carregando ? "Enviando..." : children}
    </button>
  );
}

const inputCls = "border border-gray-200 rounded-xl px-3 py-2.5 font-dm text-sm focus:outline-none focus:border-[#19c19e] bg-white";
