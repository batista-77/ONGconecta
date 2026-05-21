export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  perfil: "gestor" | "voluntario";
  ativo: boolean;
};

export type CategoriaApi = {
  id: number;
  nome: string;
  descricao?: string;
};

export type ItemApi = {
  id: number;
  nome: string;
  descricao?: string;
  unidade_medida: string;
  estoque_minimo: number;
  categoria_id: number;
  categoria?: string;
  quantidade_atual: number;
};

export type DoadorApi = {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  documento?: string;
  endereco?: string;
};

export type EntradaEstoqueApi = {
  id: number;
  item_id: number;
  item?: string;
  doador_id?: number;
  doador?: string;
  lote: string;
  validade: string;
  quantidade: number;
  quantidade_disponivel: number;
};

export type BeneficiarioApi = {
  id: number;
  nome: string;
  documento?: string;
  telefone?: string;
  endereco?: string;
  prioridade: "baixa" | "media" | "alta";
  quantidade_pessoas_familia: number;
};

export type KitApi = {
  id: number;
  nome: string;
  descricao?: string;
  status: "pendente" | "aprovado" | "entregue";
  aprovado_por_id?: number;
  itens: Array<{
    id: number;
    kit_id: number;
    item_id: number;
    item?: string;
    quantidade: number;
  }>;
};

export type EntregaApi = {
  id: number;
  kit_id: number;
  beneficiario_id: number;
  beneficiario?: string;
  responsavel_id: number;
  responsavel?: string;
  data_entrega: string;
  observacao?: string;
};

export type StatusSolicitacao = "pendente" | "aprovada" | "recusada" | "recebida";

export type SolicitacaoDoacaoApi = {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  tipo_doacao: string;
  descricao_itens: string;
  quantidade_aproximada?: string;
  validade?: string | null;
  endereco_retirada?: string;
  observacao?: string;
  status: StatusSolicitacao;
  criado_em: string;
};

export type SolicitacaoVoluntarioApi = {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  disponibilidade?: string;
  area_interesse?: string;
  mensagem?: string;
  status: StatusSolicitacao;
  criado_em: string;
};

export type ResumoDashboardApi = {
  total_entregas: number;
  total_beneficiarios: number;
  total_kits_entregues: number;
  itens_estoque_baixo: ItemApi[];
  itens_vencendo: EntradaEstoqueApi[];
};

export type Sessao = {
  token: string;
  usuario: Usuario;
};

function lerToken() {
  return localStorage.getItem("ongconecta_token");
}

export function salvarSessao(sessao: Sessao) {
  localStorage.setItem("ongconecta_token", sessao.token);
  localStorage.setItem("ongconecta_usuario", JSON.stringify(sessao.usuario));
}

export function lerUsuarioSalvo(): Usuario | null {
  const bruto = localStorage.getItem("ongconecta_usuario");
  if (!bruto) return null;
  try {
    return JSON.parse(bruto) as Usuario;
  } catch {
    return null;
  }
}

export function limparSessao() {
  localStorage.removeItem("ongconecta_token");
  localStorage.removeItem("ongconecta_usuario");
}

async function requisitar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const token = lerToken();
  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opcoes.headers ?? {}),
    },
  });

  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok || corpo.sucesso === false) {
    throw new Error(corpo.mensagem ?? "Nao foi possivel completar a requisicao.");
  }
  return corpo.dados as T;
}

export const api = {
  login: (email: string, senha: string) =>
    requisitar<Sessao>("/autenticacao/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    }),
  cadastrar: (dados: { nome: string; email: string; senha: string }) =>
    requisitar<Usuario>("/autenticacao/cadastro", {
      method: "POST",
      body: JSON.stringify(dados),
    }),
  listarCategorias: () => requisitar<CategoriaApi[]>("/categorias"),
  criarCategoria: (dados: { nome: string; descricao?: string }) =>
    requisitar<CategoriaApi>("/categorias", { method: "POST", body: JSON.stringify(dados) }),
  listarItens: () => requisitar<ItemApi[]>("/itens"),
  criarItem: (dados: { nome: string; descricao?: string; unidade_medida: string; estoque_minimo: number; categoria_id: number }) =>
    requisitar<ItemApi>("/itens", { method: "POST", body: JSON.stringify(dados) }),
  listarDoadores: () => requisitar<DoadorApi[]>("/doadores"),
  criarDoador: (dados: { nome: string; email?: string; telefone?: string; documento?: string; endereco?: string }) =>
    requisitar<DoadorApi>("/doadores", { method: "POST", body: JSON.stringify(dados) }),
  listarEntradas: () => requisitar<EntradaEstoqueApi[]>("/estoque/entradas"),
  criarEntrada: (dados: { item_id: number; doador_id?: number; lote: string; validade: string; quantidade: number }) =>
    requisitar<EntradaEstoqueApi>("/estoque/entradas", { method: "POST", body: JSON.stringify(dados) }),
  listarBeneficiarios: () => requisitar<BeneficiarioApi[]>("/beneficiarios"),
  criarBeneficiario: (dados: { nome: string; documento?: string; telefone?: string; endereco?: string; prioridade: string; quantidade_pessoas_familia: number }) =>
    requisitar<BeneficiarioApi>("/beneficiarios", { method: "POST", body: JSON.stringify(dados) }),
  listarKits: () => requisitar<KitApi[]>("/kits"),
  criarKit: (dados: { nome: string; descricao?: string }) =>
    requisitar<KitApi>("/kits", { method: "POST", body: JSON.stringify(dados) }),
  adicionarItemKit: (kitId: number, dados: { item_id: number; quantidade: number }) =>
    requisitar<KitApi>(`/kits/${kitId}/itens`, { method: "POST", body: JSON.stringify(dados) }),
  aprovarKit: (kitId: number) => requisitar<KitApi>(`/kits/${kitId}/aprovar`, { method: "POST" }),
  listarEntregas: () => requisitar<EntregaApi[]>("/entregas"),
  criarEntrega: (dados: { kit_id: number; beneficiario_id: number; data_entrega: string; observacao?: string }) =>
    requisitar<EntregaApi>("/entregas", { method: "POST", body: JSON.stringify(dados) }),
  resumoDashboard: () => requisitar<ResumoDashboardApi>("/dashboard/resumo"),
  enviarSolicitacaoDoacao: (dados: {
    nome: string;
    email?: string;
    telefone?: string;
    tipo_doacao: string;
    descricao_itens: string;
    quantidade_aproximada?: string;
    validade?: string;
    endereco_retirada?: string;
    observacao?: string;
  }) => requisitar<SolicitacaoDoacaoApi>("/solicitacoes/doacoes", { method: "POST", body: JSON.stringify(dados) }),
  enviarSolicitacaoVoluntario: (dados: {
    nome: string;
    email: string;
    telefone?: string;
    disponibilidade?: string;
    area_interesse?: string;
    mensagem?: string;
  }) => requisitar<SolicitacaoVoluntarioApi>("/solicitacoes/voluntarios", { method: "POST", body: JSON.stringify(dados) }),
  listarSolicitacoesDoacao: () => requisitar<SolicitacaoDoacaoApi[]>("/solicitacoes/doacoes"),
  listarSolicitacoesVoluntario: () => requisitar<SolicitacaoVoluntarioApi[]>("/solicitacoes/voluntarios"),
  atualizarStatusSolicitacaoDoacao: (id: number, status: StatusSolicitacao) =>
    requisitar<SolicitacaoDoacaoApi>(`/solicitacoes/doacoes/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  atualizarStatusSolicitacaoVoluntario: (id: number, status: StatusSolicitacao) =>
    requisitar<SolicitacaoVoluntarioApi>(`/solicitacoes/voluntarios/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
};
