import { useEffect, useMemo, useState } from "react";
import {
  api,
  type SolicitacaoDoacaoApi,
  type SolicitacaoVoluntarioApi,
  type StatusSolicitacao,
} from "../lib/api";
import { KpiCard, ModulePage, PageHeader, StatusBadge, Toast } from "./ModulePrimitives";

function tomStatus(status: StatusSolicitacao) {
  if (status === "recebida" || status === "aprovada") return "teal" as const;
  if (status === "recusada") return "red" as const;
  return "amber" as const;
}

export default function SolicitacoesPublicas() {
  const [doacoes, setDoacoes] = useState<SolicitacaoDoacaoApi[]>([]);
  const [voluntarios, setVoluntarios] = useState<SolicitacaoVoluntarioApi[]>([]);
  const [aba, setAba] = useState<"doacoes" | "voluntarios">("doacoes");
  const [toast, setToast] = useState({ visivel: false, msg: "" });

  async function carregarDados() {
    const [doacoesApi, voluntariosApi] = await Promise.all([
      api.listarSolicitacoesDoacao(),
      api.listarSolicitacoesVoluntario(),
    ]);
    setDoacoes(doacoesApi);
    setVoluntarios(voluntariosApi);
  }

  useEffect(() => {
    carregarDados().catch((erro) => mostrarToast(erro.message));
  }, []);

  const pendentes = useMemo(
    () => doacoes.filter((item) => item.status === "pendente").length + voluntarios.filter((item) => item.status === "pendente").length,
    [doacoes, voluntarios],
  );

  function mostrarToast(msg: string) {
    setToast({ visivel: true, msg });
    setTimeout(() => setToast({ visivel: false, msg: "" }), 2500);
  }

  async function alterarDoacao(id: number, status: StatusSolicitacao) {
    try {
      await api.atualizarStatusSolicitacaoDoacao(id, status);
      await carregarDados();
      mostrarToast("Status da doacao atualizado.");
    } catch (erro) {
      mostrarToast(erro instanceof Error ? erro.message : "Erro ao atualizar solicitacao.");
    }
  }

  async function alterarVoluntario(id: number, status: StatusSolicitacao) {
    try {
      await api.atualizarStatusSolicitacaoVoluntario(id, status);
      await carregarDados();
      mostrarToast("Status do voluntario atualizado.");
    } catch (erro) {
      mostrarToast(erro instanceof Error ? erro.message : "Erro ao atualizar solicitacao.");
    }
  }

  return (
    <ModulePage>
      <PageHeader icon="📨" title="Solicitacoes" description="Pedidos publicos enviados pelo site antes de virarem estoque ou usuario interno." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Solicitacoes" value={doacoes.length + voluntarios.length} sub="total recebido" destaque />
        <KpiCard label="Pendentes" value={pendentes} sub="aguardam analise" alerta={pendentes > 0} />
        <KpiCard label="Doacoes" value={doacoes.length} sub="ofertas de itens" />
        <KpiCard label="Voluntarios" value={voluntarios.length} sub="pessoas interessadas" />
      </div>

      <div className="flex gap-2 mb-5">
        {(["doacoes", "voluntarios"] as const).map((item) => (
          <button
            key={item}
            className={`font-dm text-sm font-semibold px-5 py-2.5 rounded-full border-2 transition-all ${
              aba === item ? "border-[#2DD4BF] bg-[#CCFBF1] text-[#0D9488]" : "border-gray-200 bg-white text-gray-400"
            }`}
            onClick={() => setAba(item)}
          >
            {item === "doacoes" ? "Doacoes" : "Voluntarios"}
          </button>
        ))}
      </div>

      {aba === "doacoes" ? (
        <div className="grid gap-4">
          {doacoes.length === 0 ? (
            <p className="font-dm text-sm text-gray-400 bg-white rounded-2xl border border-gray-100 p-8 text-center">Nenhuma solicitacao de doacao recebida.</p>
          ) : doacoes.map((solicitacao) => (
            <div key={solicitacao.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col md:flex-row md:justify-between gap-3">
                <div>
                  <p className="font-dm text-sm font-semibold text-gray-900">{solicitacao.nome}</p>
                  <p className="font-dm text-xs text-gray-400 mt-1">{solicitacao.telefone || "Sem telefone"} · {solicitacao.email || "Sem email"}</p>
                  <p className="font-dm text-sm text-gray-600 mt-3">{solicitacao.tipo_doacao}: {solicitacao.descricao_itens}</p>
                  <p className="font-dm text-xs text-gray-500 mt-2">
                    Quantidade: {solicitacao.quantidade_aproximada || "nao informada"} · Validade: {solicitacao.validade || "nao informada"}
                  </p>
                  <p className="font-dm text-xs text-gray-500 mt-1">{solicitacao.endereco_retirada || "Sem endereco de retirada"}</p>
                </div>
                <StatusBadge tone={tomStatus(solicitacao.status)}>{solicitacao.status}</StatusBadge>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {(["aprovada", "recusada", "recebida"] as StatusSolicitacao[]).map((status) => (
                  <button key={status} className="font-dm text-xs font-semibold px-3 py-1.5 rounded-full border-2 border-gray-200 bg-white text-gray-500 hover:border-[#2DD4BF]" onClick={() => alterarDoacao(solicitacao.id, status)}>
                    Marcar {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {voluntarios.length === 0 ? (
            <p className="font-dm text-sm text-gray-400 bg-white rounded-2xl border border-gray-100 p-8 text-center">Nenhuma solicitacao de voluntariado recebida.</p>
          ) : voluntarios.map((solicitacao) => (
            <div key={solicitacao.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col md:flex-row md:justify-between gap-3">
                <div>
                  <p className="font-dm text-sm font-semibold text-gray-900">{solicitacao.nome}</p>
                  <p className="font-dm text-xs text-gray-400 mt-1">{solicitacao.email} · {solicitacao.telefone || "Sem telefone"}</p>
                  <p className="font-dm text-sm text-gray-600 mt-3">{solicitacao.area_interesse || "Area nao informada"}</p>
                  <p className="font-dm text-xs text-gray-500 mt-2">{solicitacao.disponibilidade || "Disponibilidade nao informada"}</p>
                  <p className="font-dm text-xs text-gray-500 mt-1">{solicitacao.mensagem || "Sem mensagem."}</p>
                </div>
                <StatusBadge tone={tomStatus(solicitacao.status)}>{solicitacao.status}</StatusBadge>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {(["aprovada", "recusada"] as StatusSolicitacao[]).map((status) => (
                  <button key={status} className="font-dm text-xs font-semibold px-3 py-1.5 rounded-full border-2 border-gray-200 bg-white text-gray-500 hover:border-[#2DD4BF]" onClick={() => alterarVoluntario(solicitacao.id, status)}>
                    Marcar {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Toast visivel={toast.visivel} msg={toast.msg} />
    </ModulePage>
  );
}
