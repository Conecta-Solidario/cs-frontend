export enum TipoUsuario {
  DOADOR = 'DOADOR',
  RECEPTOR = 'RECEPTOR'
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  tipo: TipoUsuario;
  telefone?: string;
  endereco?: string;
  ativo: boolean;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  tipo: TipoUsuario;
  telefone?: string;
  endereco?: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}
