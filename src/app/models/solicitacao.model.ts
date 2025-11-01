export enum StatusSolicitacao {
  PENDENTE = 'PENDENTE',
  APROVADA = 'APROVADA',
  REJEITADA = 'REJEITADA',
  ENTREGUE = 'ENTREGUE',
  CANCELADA = 'CANCELADA'
}

export interface Solicitacao {
  id: number;
  itemId: number;
  itemNome?: string;
  itemTipo?: string;
  receptorId: number;
  receptorNome?: string;
  receptorEndereco?: string;
  receptorTelefone?: string;
  quantidadeSolicitada: number;
  motivo: string;
  status: StatusSolicitacao;
  observacoes?: string;
  dataSolicitacao: Date;
  dataResposta?: Date;
  dataEntrega?: Date;
  doadorId?: number;
  doadorNome?: string;
}

export interface SolicitacaoCreateRequest {
  itemId: number;
  quantidadeSolicitada: number;
  motivo: string;
  observacoes?: string;
}

export interface SolicitacaoUpdateRequest {
  status?: StatusSolicitacao;
  observacoes?: string;
}
