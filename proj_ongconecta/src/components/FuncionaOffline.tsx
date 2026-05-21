import { useEffect, useState } from "react";
import { KpiCard, ModulePage, PageHeader, PrimaryButton, StatusBadge, Toast } from "./ModulePrimitives";

type Pendencia = {
  id: number;
  modulo: string;
  acao: string;
  horario: string;
};

const PENDENCIAS_INICIAIS: Pendencia[] = [
  { id: 1, modulo: "Doacoes", acao: "Nova doacao aguardando envio", horario: "09:20" },
  { id: 2, modulo: "Entregas", acao: "Status atualizado localmente", horario: "10:45" },
];

export default function FuncionaOffline() {
  const [online, setOnline] = useState(navigator.onLine);
  const [pendencias, setPendencias] = useState(PENDENCIAS_INICIAIS);
  const [toast, setToast] = useState({ visivel: false, msg: "" });

  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      setToast({ visivel: true, msg: "Conexao restabelecida. Sincronizando..." });
      setTimeout(() => {
        setPendencias([]);
        setToast({ visivel: false, msg: "" });
      }, 1200);
    };
    const onOffline = () => setOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  function simularAcaoLocal() {
    setPendencias((prev) => [
      { id: Date.now(), modulo: "Sistema", acao: "Alteracao salva no armazenamento local", horario: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) },
      ...prev,
    ]);
    setToast({ visivel: true, msg: "Acao salva localmente." });
    setTimeout(() => setToast({ visivel: false, msg: "" }), 2500);
  }

  function sincronizarAgora() {
    if (!online) {
      setToast({ visivel: true, msg: "Sem conexao. A fila permanece salva." });
      setTimeout(() => setToast({ visivel: false, msg: "" }), 2500);
      return;
    }

    setPendencias([]);
    setToast({ visivel: true, msg: "Fila sincronizada com sucesso." });
    setTimeout(() => setToast({ visivel: false, msg: "" }), 2500);
  }

  return (
    <ModulePage>
      <PageHeader
        icon="🔒"
        title="Funciona Offline"
        description="Deteccao de conexao, armazenamento temporario local e sincronizacao quando a internet retornar."
        actions={
          <>
            <PrimaryButton onClick={simularAcaoLocal}>Simular acao local</PrimaryButton>
            <button className="font-dm text-sm font-semibold bg-white text-gray-600 px-5 py-2.5 rounded-full border-2 border-gray-200 hover:border-[#2DD4BF]" onClick={sincronizarAgora}>
              Sincronizar agora
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Status" value={online ? "Online" : "Offline"} sub="conexao atual" destaque={online} alerta={!online} />
        <KpiCard label="Pendencias" value={pendencias.length} sub="acoes na fila local" alerta={pendencias.length > 0} />
        <KpiCard label="Armazenamento" value="Local" sub="dados temporarios" />
        <KpiCard label="Sincronizacao" value={online ? "Auto" : "Pausada"} sub="retomada por conexao" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-6">
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="font-lora text-base font-bold text-[#134E4A] mb-4">Indicador de conexao</p>
          <div className="rounded-2xl p-5 border border-gray-100 bg-[#F8FAF9]">
            <StatusBadge tone={online ? "teal" : "amber"}>{online ? "Online" : "Offline"}</StatusBadge>
            <p className="font-dm text-sm text-gray-500 leading-6 mt-4">
              Quando a conexao cai, as acoes entram em uma fila local. Quando a conexao volta, a fila pode ser enviada automaticamente para o backend.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between">
            <p className="font-lora text-base font-bold text-[#134E4A]">Fila de sincronizacao</p>
            <p className="font-dm text-xs text-gray-400">{pendencias.length} pendencias</p>
          </div>
          <div className="divide-y divide-gray-100">
            {pendencias.length === 0 ? (
              <p className="font-dm text-sm text-gray-400 text-center py-12">Nenhuma pendencia local.</p>
            ) : (
              pendencias.map((pendencia) => (
                <div key={pendencia.id} className="p-5 hover:bg-[#F0FDFA] transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="font-dm text-sm font-semibold text-gray-900">{pendencia.modulo}</p>
                    <p className="font-dm text-xs text-gray-500 mt-1">{pendencia.acao}</p>
                  </div>
                  <StatusBadge tone="gray">{pendencia.horario}</StatusBadge>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
      <Toast visivel={toast.visivel} msg={toast.msg} />
    </ModulePage>
  );
}
