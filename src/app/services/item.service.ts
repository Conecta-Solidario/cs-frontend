import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Item, ItemCreateRequest, StatusItem, TipoItem, EstadoConservacao } from '../models/item.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private items: Item[] = [
    {
      id: 1,
      nome: 'Cesta Básica',
      descricao: 'Cesta básica completa com arroz, feijão, açúcar, macarrão, óleo e café',
      tipo: TipoItem.ALIMENTO,
      quantidade: 3,
      estadoConservacao: EstadoConservacao.NOVO,
      status: StatusItem.DISPONIVEL,
      doadorId: 1,
      doadorNome: 'João Silva',
      dataCadastro: new Date('2024-01-15'),
      dataAtualizacao: new Date('2024-01-15')
    },
    {
      id: 2,
      nome: 'Roupas Infantis',
      descricao: 'Conjunto de roupas infantis tamanhos 6-10 anos em bom estado',
      tipo: TipoItem.ROUPA,
      quantidade: 1,
      estadoConservacao: EstadoConservacao.SEMI_NOVO,
      status: StatusItem.DISPONIVEL,
      doadorId: 1,
      doadorNome: 'João Silva',
      dataCadastro: new Date('2024-01-20'),
      dataAtualizacao: new Date('2024-01-20')
    },
    {
      id: 3,
      nome: 'Mochila Escolar',
      descricao: 'Mochila escolar em bom estado, ideal para estudantes',
      tipo: TipoItem.MATERIAL_ESCOLAR,
      quantidade: 2,
      estadoConservacao: EstadoConservacao.USADO_BOM,
      status: StatusItem.DISPONIVEL,
      doadorId: 1,
      doadorNome: 'João Silva',
      dataCadastro: new Date('2024-01-18'),
      dataAtualizacao: new Date('2024-01-18')
    },
    {
      id: 4,
      nome: 'Cadernos e Canetas',
      descricao: 'Kit com 5 cadernos e 10 canetas novas',
      tipo: TipoItem.MATERIAL_ESCOLAR,
      quantidade: 5,
      estadoConservacao: EstadoConservacao.NOVO,
      status: StatusItem.DISPONIVEL,
      doadorId: 1,
      doadorNome: 'João Silva',
      dataCadastro: new Date('2024-01-22'),
      dataAtualizacao: new Date('2024-01-22')
    }
  ];

  constructor(private authService: AuthService) {
    // Carregar itens do localStorage se existirem
    this.loadItemsFromStorage();
  }

  getAllItens(): Observable<Item[]> {
    return of([...this.items]).pipe(delay(300));
  }

  getItensDisponiveis(): Observable<Item[]> {
    const disponiveis = this.items.filter(item => item.status === StatusItem.DISPONIVEL);
    return of(disponiveis).pipe(delay(300));
  }

  getItemById(id: number): Observable<Item> {
    const item = this.items.find(i => i.id === id);
    if (!item) {
      return throwError(() => new Error('Item não encontrado'));
    }
    return of({ ...item }).pipe(delay(300));
  }

  getItensByDoador(doadorId: number): Observable<Item[]> {
    const itens = this.items.filter(item => item.doadorId === doadorId);
    return of(itens).pipe(delay(300));
  }

  createItem(request: ItemCreateRequest): Observable<Item> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('Usuário não autenticado'));
    }

    if (currentUser.tipo !== 'DOADOR') {
      return throwError(() => new Error('Apenas doadores podem cadastrar itens'));
    }

    const newItem: Item = {
      id: this.getNextId(),
      nome: request.nome,
      descricao: request.descricao,
      tipo: request.tipo,
      quantidade: request.quantidade,
      estadoConservacao: request.estadoConservacao,
      status: StatusItem.DISPONIVEL,
      doadorId: currentUser.id,
      doadorNome: currentUser.nome,
      dataCadastro: new Date(),
      dataAtualizacao: new Date(),
      foto: request.foto
    };

    this.items.push(newItem);
    this.saveItemsToStorage();

    return of({ ...newItem }).pipe(delay(500));
  }

  updateItem(id: number, request: Partial<Item>): Observable<Item> {
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) {
      return throwError(() => new Error('Item não encontrado'));
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || this.items[index].doadorId !== currentUser.id) {
      return throwError(() => new Error('Você não tem permissão para editar este item'));
    }

    this.items[index] = {
      ...this.items[index],
      ...request,
      dataAtualizacao: new Date()
    };

    this.saveItemsToStorage();

    return of({ ...this.items[index] }).pipe(delay(500));
  }

  deleteItem(id: number): Observable<void> {
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) {
      return throwError(() => new Error('Item não encontrado'));
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || this.items[index].doadorId !== currentUser.id) {
      return throwError(() => new Error('Você não tem permissão para excluir este item'));
    }

    this.items.splice(index, 1);
    this.saveItemsToStorage();

    return of(void 0).pipe(delay(300));
  }

  private getNextId(): number {
    return this.items.length > 0 
      ? Math.max(...this.items.map(i => i.id)) + 1 
      : 1;
  }

  private saveItemsToStorage(): void {
    try {
      localStorage.setItem('conecta_solidario_items', JSON.stringify(this.items));
    } catch (e) {
      console.error('Erro ao salvar itens no storage:', e);
    }
  }

  private loadItemsFromStorage(): void {
    try {
      const itemsStr = localStorage.getItem('conecta_solidario_items');
      if (itemsStr) {
        const loadedItems = JSON.parse(itemsStr);
        // Converter strings de data de volta para Date
        this.items = loadedItems.map((item: any) => ({
          ...item,
          dataCadastro: new Date(item.dataCadastro),
          dataAtualizacao: item.dataAtualizacao ? new Date(item.dataAtualizacao) : undefined
        }));
      }
    } catch (e) {
      console.error('Erro ao carregar itens do storage:', e);
    }
  }
}
