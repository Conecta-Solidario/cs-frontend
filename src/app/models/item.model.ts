export enum TipoItem {
  ALIMENTO = 'ALIMENTO',
  ROUPA = 'ROUPA',
  MATERIAL_ESCOLAR = 'MATERIAL_ESCOLAR'
}

export enum EstadoConservacao {
  NOVO = 'NOVO',
  SEMI_NOVO = 'SEMI_NOVO',
  USADO_BOM = 'USADO_BOM',
  USADO_REGULAR = 'USADO_REGULAR'
}

export enum StatusItem {
  DISPONIVEL = 'DISPONIVEL',
  SOLICITADO = 'SOLICITADO',
  RESERVADO = 'RESERVADO',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO'
}

export interface Item {
  id: number;
  nome: string;
  descricao: string;
  tipo: TipoItem;
  quantidade: number;
  estadoConservacao: EstadoConservacao;
  status: StatusItem;
  doadorId: number;
  doadorNome?: string;
  dataCadastro: Date;
  dataAtualizacao?: Date;
  foto?: string;
}

export interface ItemCreateRequest {
  nome: string;
  descricao: string;
  tipo: TipoItem;
  quantidade: number;
  estadoConservacao: EstadoConservacao;
  foto?: string;
}

export interface ItemUpdateRequest {
  nome?: string;
  descricao?: string;
  quantidade?: number;
  estadoConservacao?: EstadoConservacao;
  status?: StatusItem;
  foto?: string;
}
