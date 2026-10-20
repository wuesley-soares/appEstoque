export interface Usuario {
  id: number;
  nome: string;
  email: string;
}

// O que a API (ou o mock) devolve depois de um login bem-sucedido.
export interface LoginResponse {
  accessToken: string;
  usuario: Usuario;
}

export interface Categoria {
  id: number;
  nome: string;
}

export interface Produto {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  categoria: Categoria; // objeto aninhado, não apenas o ID
}

// "Union type": o valor só pode ser uma dessas duas strings.
export type TipoMovimentacao = 'ENTRADA' | 'SAIDA';

export interface Movimentacao {
  id: number;
  produto: Produto;
  tipo: TipoMovimentacao;
  quantidade: number;
  criadoEm: string; // data em formato ISO, como viria do backend em JSON
}