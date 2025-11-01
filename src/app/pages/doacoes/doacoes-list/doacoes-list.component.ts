import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ItemService } from '../../../services/item.service';
import { SolicitacaoService } from '../../../services/solicitacao.service';
import { AuthService } from '../../../services/auth.service';
import { Item, TipoItem, EstadoConservacao, StatusItem } from '../../../models/item.model';
import { Solicitacao, StatusSolicitacao } from '../../../models/solicitacao.model';

@Component({
  selector: 'app-doacoes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './doacoes-list.component.html',
  styleUrl: './doacoes-list.component.css'
})
export class DoacoesListComponent implements OnInit {
  itens: Item[] = [];
  solicitacoes: Solicitacao[] = [];
  filteredItens: Item[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Filtros
  filtroTipo: TipoItem | '' = '';
  filtroStatus: StatusItem | '' = '';
  buscaTexto: string = '';

  tipoItemOptions = [
    { value: '', label: 'Todos os tipos' },
    { value: TipoItem.ALIMENTO, label: 'Alimento' },
    { value: TipoItem.ROUPA, label: 'Roupa' },
    { value: TipoItem.MATERIAL_ESCOLAR, label: 'Material Escolar' }
  ];

  statusItemOptions = [
    { value: '', label: 'Todos os status' },
    { value: StatusItem.DISPONIVEL, label: 'Disponível' },
    { value: StatusItem.SOLICITADO, label: 'Solicitado' },
    { value: StatusItem.RESERVADO, label: 'Reservado' },
    { value: StatusItem.ENTREGUE, label: 'Entregue' },
    { value: StatusItem.CANCELADO, label: 'Cancelado' }
  ];

  constructor(
    private itemService: ItemService,
    private solicitacaoService: SolicitacaoService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.errorMessage = 'Você precisa estar autenticado para visualizar suas doações';
      return;
    }

    if (!this.authService.isDoador()) {
      this.errorMessage = 'Esta página é apenas para doadores';
      return;
    }

    this.loadDoacoes();
  }

  loadDoacoes(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage = 'Usuário não autenticado';
      this.loading = false;
      return;
    }

    // Carregar itens do doador
    this.itemService.getItensByDoador(currentUser.id).subscribe({
      next: (itens) => {
        this.itens = itens;
        
        // Carregar solicitações relacionadas aos itens
        this.solicitacaoService.getSolicitacoesByDoador(currentUser.id).subscribe({
          next: (solicitacoes) => {
            this.solicitacoes = solicitacoes;
            this.aplicarFiltros();
            this.loading = false;
          },
          error: (error) => {
            this.errorMessage = 'Erro ao carregar solicitações';
            this.loading = false;
          }
        });
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao carregar doações';
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.filteredItens = this.itens.filter(item => {
      // Filtro por tipo
      if (this.filtroTipo && item.tipo !== this.filtroTipo) {
        return false;
      }

      // Filtro por status
      if (this.filtroStatus && item.status !== this.filtroStatus) {
        return false;
      }

      // Filtro por busca de texto
      if (this.buscaTexto.trim()) {
        const busca = this.buscaTexto.toLowerCase();
        const matchNome = item.nome.toLowerCase().includes(busca);
        const matchDescricao = item.descricao.toLowerCase().includes(busca);
        if (!matchNome && !matchDescricao) {
          return false;
        }
      }

      return true;
    });
  }

  limparFiltros(): void {
    this.filtroTipo = '';
    this.filtroStatus = '';
    this.buscaTexto = '';
    this.aplicarFiltros();
  }

  getTipoItemLabel(tipo: TipoItem): string {
    const option = this.tipoItemOptions.find(opt => opt.value === tipo);
    return option ? option.label : tipo;
  }

  getEstadoLabel(estado: EstadoConservacao): string {
    const estados: { [key: string]: string } = {
      'NOVO': 'Novo',
      'SEMI_NOVO': 'Semi-novo',
      'USADO_BOM': 'Usado em bom estado',
      'USADO_REGULAR': 'Usado em estado regular'
    };
    return estados[estado] || estado;
  }

  getStatusLabel(status: StatusItem): string {
    const option = this.statusItemOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  }

  getStatusClass(status: StatusItem): string {
    const classes: { [key: string]: string } = {
      'DISPONIVEL': 'badge-disponivel',
      'SOLICITADO': 'badge-solicitado',
      'RESERVADO': 'badge-reservado',
      'ENTREGUE': 'badge-entregue',
      'CANCELADO': 'badge-cancelado'
    };
    return classes[status] || 'badge-default';
  }

  formatarData(data: Date): string {
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getSolicitacaoByItem(itemId: number): Solicitacao | undefined {
    return this.solicitacoes.find(s => s.itemId === itemId);
  }

  deletarItem(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.')) {
      return;
    }

    this.itemService.deleteItem(id).subscribe({
      next: () => {
        this.successMessage = 'Item excluído com sucesso';
        this.loadDoacoes();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao excluir item';
      }
    });
  }

  podeDeletar(item: Item): boolean {
    return item.status === StatusItem.DISPONIVEL || item.status === StatusItem.CANCELADO;
  }

  podeEditar(item: Item): boolean {
    return item.status === StatusItem.DISPONIVEL || item.status === StatusItem.CANCELADO;
  }

  verSolicitacao(item: Item): void {
    const solicitacao = this.getSolicitacaoByItem(item.id);
    if (solicitacao) {
      // Navegar para a página de solicitações com filtro ou mostrar modal
      // Por enquanto, vamos apenas mostrar um alerta
      alert(`Solicitação ${solicitacao.status} de ${solicitacao.receptorNome}\nMotivo: ${solicitacao.motivo}`);
    }
  }

  getEstatisticas(): { total: number; disponiveis: number; solicitados: number; reservados: number; entregues: number } {
    return {
      total: this.itens.length,
      disponiveis: this.itens.filter(i => i.status === StatusItem.DISPONIVEL).length,
      solicitados: this.itens.filter(i => i.status === StatusItem.SOLICITADO).length,
      reservados: this.itens.filter(i => i.status === StatusItem.RESERVADO).length,
      entregues: this.itens.filter(i => i.status === StatusItem.ENTREGUE).length
    };
  }
}