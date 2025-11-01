import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError, switchMap } from 'rxjs';
import { Solicitacao, SolicitacaoCreateRequest, StatusSolicitacao } from '../models/solicitacao.model';
import { AuthService } from './auth.service';
import { ItemService } from './item.service';
import { StatusItem } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class SolicitacaoService {
  private solicitacoes: Solicitacao[] = [
    {
      id: 1,
      itemId: 1,
      itemNome: 'Cesta Básica',
      itemTipo: 'ALIMENTO',
      receptorId: 2,
      receptorNome: 'Maria Santos',
      receptorEndereco: 'Av. Principal, 456',
      receptorTelefone: '(11) 88888-8888',
      quantidadeSolicitada: 1,
      motivo: 'Família com 4 crianças em situação de vulnerabilidade social',
      status: StatusSolicitacao.PENDENTE,
      dataSolicitacao: new Date('2024-01-25'),
      doadorId: 1,
      doadorNome: 'João Silva'
    }
  ];

  private readonly MAX_SOLICITACOES_PENDENTES = 3;
  private readonly MAX_SOLICITACOES_APROVADAS = 2;

  constructor(
    private authService: AuthService,
    private itemService: ItemService
  ) {
    this.loadSolicitacoesFromStorage();
  }

  getAllSolicitacoes(): Observable<Solicitacao[]> {
    return of([...this.solicitacoes]).pipe(delay(300));
  }

  getSolicitacoesByReceptor(receptorId: number): Observable<Solicitacao[]> {
    const solicitacoes = this.solicitacoes.filter(s => s.receptorId === receptorId);
    return of(solicitacoes).pipe(delay(300));
  }

  getSolicitacoesByDoador(doadorId: number): Observable<Solicitacao[]> {
    const solicitacoes = this.solicitacoes.filter(s => s.doadorId === doadorId);
    return of(solicitacoes).pipe(delay(300));
  }

  getSolicitacoesByItem(itemId: number): Observable<Solicitacao[]> {
    const solicitacoes = this.solicitacoes.filter(s => s.itemId === itemId);
    return of(solicitacoes).pipe(delay(300));
  }

  getSolicitacaoById(id: number): Observable<Solicitacao> {
    const solicitacao = this.solicitacoes.find(s => s.id === id);
    if (!solicitacao) {
      return throwError(() => new Error('Solicitação não encontrada'));
    }
    return of({ ...solicitacao }).pipe(delay(300));
  }

  createSolicitacao(request: SolicitacaoCreateRequest): Observable<Solicitacao> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('Usuário não autenticado'));
    }

    if (currentUser.tipo !== 'RECEPTOR') {
      return throwError(() => new Error('Apenas receptores podem solicitar itens'));
    }

    // Verificar limite de solicitações pendentes
    const solicitacoesPendentes = this.solicitacoes.filter(
      s => s.receptorId === currentUser.id && s.status === StatusSolicitacao.PENDENTE
    );
    if (solicitacoesPendentes.length >= this.MAX_SOLICITACOES_PENDENTES) {
      return throwError(() => new Error(`Você já possui ${this.MAX_SOLICITACOES_PENDENTES} solicitações pendentes. Aguarde a resposta antes de criar novas solicitações.`));
    }

    // Verificar limite de solicitações aprovadas
    const solicitacoesAprovadas = this.solicitacoes.filter(
      s => s.receptorId === currentUser.id && s.status === StatusSolicitacao.APROVADA
    );
    if (solicitacoesAprovadas.length >= this.MAX_SOLICITACOES_APROVADAS) {
      return throwError(() => new Error(`Você já possui ${this.MAX_SOLICITACOES_APROVADAS} solicitações aprovadas. Complete as entregas antes de criar novas solicitações.`));
    }

    // Verificar se já existe solicitação pendente para o mesmo item
    const solicitacaoExistente = this.solicitacoes.find(
      s => s.itemId === request.itemId && 
           s.receptorId === currentUser.id && 
           (s.status === StatusSolicitacao.PENDENTE || s.status === StatusSolicitacao.APROVADA)
    );
    if (solicitacaoExistente) {
      return throwError(() => new Error('Você já possui uma solicitação ativa para este item'));
    }

    // Buscar o item e criar solicitação
    return this.itemService.getItemById(request.itemId).pipe(
      switchMap((item) => {
        // Verificar se o item está disponível
        if (!item || item.status !== StatusItem.DISPONIVEL) {
          return throwError(() => new Error('Item não está disponível para solicitação'));
        }

        // Verificar quantidade
        if (request.quantidadeSolicitada > item.quantidade) {
          return throwError(() => new Error('Quantidade solicitada maior que a disponível'));
        }

        // Criar nova solicitação
        const newSolicitacao: Solicitacao = {
          id: this.getNextId(),
          itemId: request.itemId,
          itemNome: item.nome,
          itemTipo: item.tipo,
          receptorId: currentUser.id,
          receptorNome: currentUser.nome,
          receptorEndereco: currentUser.endereco,
          receptorTelefone: currentUser.telefone,
          quantidadeSolicitada: request.quantidadeSolicitada,
          motivo: request.motivo,
          status: StatusSolicitacao.PENDENTE,
          observacoes: request.observacoes,
          dataSolicitacao: new Date(),
          doadorId: item.doadorId,
          doadorNome: item.doadorNome
        };

        this.solicitacoes.push(newSolicitacao);
        this.saveSolicitacoesToStorage();

        // Atualizar status do item para SOLICITADO
        this.itemService.updateItem(request.itemId, { status: StatusItem.SOLICITADO }).subscribe();

        return of({ ...newSolicitacao }).pipe(delay(500));
      })
    );
  }

  updateSolicitacao(id: number, request: Partial<Solicitacao>): Observable<Solicitacao> {
    const index = this.solicitacoes.findIndex(s => s.id === id);
    if (index === -1) {
      return throwError(() => new Error('Solicitação não encontrada'));
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('Usuário não autenticado'));
    }

    const solicitacao = this.solicitacoes[index];

    // Verificar permissões
    if (request.status) {
      // Apenas doador pode aprovar/rejeitar
      if (solicitacao.doadorId !== currentUser.id && currentUser.tipo !== 'DOADOR') {
        return throwError(() => new Error('Você não tem permissão para alterar o status desta solicitação'));
      }

      // Atualizar data de resposta se mudou para aprovada/rejeitada
      if (request.status === StatusSolicitacao.APROVADA || request.status === StatusSolicitacao.REJEITADA) {
        request.dataResposta = new Date();
      }

      // Atualizar status do item
      if (request.status === StatusSolicitacao.APROVADA) {
        this.itemService.updateItem(solicitacao.itemId, { status: StatusItem.RESERVADO }).subscribe();
      } else if (request.status === StatusSolicitacao.REJEITADA) {
        this.itemService.updateItem(solicitacao.itemId, { status: StatusItem.DISPONIVEL }).subscribe();
      } else if (request.status === StatusSolicitacao.ENTREGUE) {
        this.itemService.updateItem(solicitacao.itemId, { status: StatusItem.ENTREGUE }).subscribe();
        request.dataEntrega = new Date();
      }
    }

    this.solicitacoes[index] = {
      ...this.solicitacoes[index],
      ...request
    };

    this.saveSolicitacoesToStorage();

    return of({ ...this.solicitacoes[index] }).pipe(delay(500));
  }

  cancelSolicitacao(id: number): Observable<void> {
    const index = this.solicitacoes.findIndex(s => s.id === id);
    if (index === -1) {
      return throwError(() => new Error('Solicitação não encontrada'));
    }

    const solicitacao = this.solicitacoes[index];
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || solicitacao.receptorId !== currentUser.id) {
      return throwError(() => new Error('Você não tem permissão para cancelar esta solicitação'));
    }

    if (solicitacao.status !== StatusSolicitacao.PENDENTE) {
      return throwError(() => new Error('Apenas solicitações pendentes podem ser canceladas'));
    }

    // Atualizar status
    this.solicitacoes[index].status = StatusSolicitacao.CANCELADA;
    
    // Liberar item
    this.itemService.updateItem(solicitacao.itemId, { status: StatusItem.DISPONIVEL }).subscribe();

    this.saveSolicitacoesToStorage();

    return of(void 0).pipe(delay(300));
  }

  private getNextId(): number {
    return this.solicitacoes.length > 0 
      ? Math.max(...this.solicitacoes.map(s => s.id)) + 1 
      : 1;
  }

  private saveSolicitacoesToStorage(): void {
    try {
      localStorage.setItem('conecta_solidario_solicitacoes', JSON.stringify(this.solicitacoes));
    } catch (e) {
      console.error('Erro ao salvar solicitações no storage:', e);
    }
  }

  private loadSolicitacoesFromStorage(): void {
    try {
      const solicitacoesStr = localStorage.getItem('conecta_solidario_solicitacoes');
      if (solicitacoesStr) {
        const loadedSolicitacoes = JSON.parse(solicitacoesStr);
        this.solicitacoes = loadedSolicitacoes.map((s: any) => ({
          ...s,
          dataSolicitacao: new Date(s.dataSolicitacao),
          dataResposta: s.dataResposta ? new Date(s.dataResposta) : undefined,
          dataEntrega: s.dataEntrega ? new Date(s.dataEntrega) : undefined
        }));
      }
    } catch (e) {
      console.error('Erro ao carregar solicitações do storage:', e);
    }
  }
}
