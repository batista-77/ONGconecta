import { useState, type FormEvent } from "react";
import { api, salvarSessao, type Usuario } from "../lib/api";

const GRADIENT_PRIMARY = "linear-gradient(135deg, #19c19e, #69e3a9)";
const SHADOW_GREEN = "0 4px 18px rgba(25,193,158,0.4)";

type Modo = "login" | "cadastro";

export default function TelaAutenticacao({ aoEntrar }: { aoEntrar: (usuario: Usuario) => void }) {
  const [modo, setModo] = useState<Modo>("login");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({
    nome: "",
    email: "admin@ongconecta.com",
    senha: "admin123",
  });

  async function enviar(event: FormEvent) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      if (modo === "cadastro") {
        await api.cadastrar({ nome: form.nome, email: form.email, senha: form.senha });
      }
      const sessao = await api.login(form.email, form.senha);
      salvarSessao(sessao);
      aoEntrar(sessao.usuario);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Nao foi possivel acessar o sistema.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9f5] grid grid-cols-1 lg:grid-cols-[1fr_480px]">
      <section className="hidden lg:flex flex-col justify-center px-20">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 bg-emerald-100/50 border border-emerald-300/50 text-[#2d4a3e] font-dm text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-7">
            OngConecta - acesso interno
          </div>
          <h1 className="font-lora font-bold text-[#1a2e25] leading-[1.18] mb-5" style={{ fontSize: "clamp(2.4rem, 4vw, 3.6rem)" }}>
            Gestao real para cada doacao.
          </h1>
          <p className="font-dm font-light text-[#3d5a4e] leading-[1.75] text-base">
            Entre para registrar entradas de estoque, montar kits, acompanhar entregas e consultar os indicadores conectados ao banco de dados.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <form onSubmit={enviar} className="w-full max-w-md bg-white rounded-2xl border border-emerald-100 shadow-[0_16px_50px_rgba(26,46,37,0.10)] p-7">
          <p className="font-lora text-2xl font-bold text-[#1a2e25] mb-1">
            {modo === "login" ? "Acessar sistema" : "Criar cadastro"}
          </p>
          <p className="font-dm text-sm text-[#6b8c7d] mb-6">
            {modo === "login" ? "Use seu email e senha para continuar." : "Novos cadastros entram como voluntario."}
          </p>

          {modo === "cadastro" ? (
            <label className="grid gap-1 mb-3">
              <span className="font-dm text-[11px] font-bold uppercase tracking-wider text-gray-400">Nome</span>
              <input
                className="border border-gray-200 rounded-xl px-3 py-2.5 font-dm text-sm focus:outline-none focus:border-[#19c19e]"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </label>
          ) : null}

          <label className="grid gap-1 mb-3">
            <span className="font-dm text-[11px] font-bold uppercase tracking-wider text-gray-400">Email</span>
            <input
              className="border border-gray-200 rounded-xl px-3 py-2.5 font-dm text-sm focus:outline-none focus:border-[#19c19e]"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>

          <label className="grid gap-1 mb-4">
            <span className="font-dm text-[11px] font-bold uppercase tracking-wider text-gray-400">Senha</span>
            <input
              className="border border-gray-200 rounded-xl px-3 py-2.5 font-dm text-sm focus:outline-none focus:border-[#19c19e]"
              type="password"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              required
            />
          </label>

          {erro ? <p className="font-dm text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 mb-4">{erro}</p> : null}

          <button
            className="w-full font-dm text-sm font-semibold text-white px-6 py-3 rounded-full border-none cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: GRADIENT_PRIMARY, boxShadow: SHADOW_GREEN }}
            disabled={carregando}
          >
            {carregando ? "Aguarde..." : modo === "login" ? "Entrar" : "Cadastrar e entrar"}
          </button>

          <button
            type="button"
            className="w-full font-dm text-sm font-semibold text-[#1a2e25] mt-4"
            onClick={() => {
              setErro("");
              setModo(modo === "login" ? "cadastro" : "login");
              setForm({
                nome: "",
                email: modo === "login" ? "" : "admin@ongconecta.com",
                senha: modo === "login" ? "" : "admin123",
              });
            }}
          >
            {modo === "login" ? "Criar novo cadastro" : "Ja tenho cadastro"}
          </button>
        </form>
      </section>
    </div>
  );
}
