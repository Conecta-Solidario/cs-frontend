import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ItemService } from '../../../services/item.service';
import { AuthService } from '../../../services/auth.service';
import { Item, TipoItem, EstadoConservacao, StatusItem } from '../../../models/item.model';
import { SolicitarItemModalComponent } from '../../../components/solicitar-item-modal/solicitar-item-modal.component';

@Component({
  selector: 'app-itens-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SolicitarItemModalComponent],
  templateUrl: './itens-list.component.html',
  styleUrl: './itens-list.component.css'
})
export class ItensListComponent implements OnInit {
  itens: Item[] = [];
  filteredItens: Item[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  selectedItem: Item | null = null;
  modalVisible: boolean = false;

  // Filtros
  filtroTipo: TipoItem | '' = '';
  filtroEstado: EstadoConservacao | '' = '';
  buscaTexto: string = '';

  tipoItemOptions = [
    { value: '', label: 'Todos os tipos' },
    { value: TipoItem.ALIMENTO, label: 'Alimento' },
    { value: TipoItem.ROUPA, label: 'Roupa' },
    { value: TipoItem.MATERIAL_ESCOLAR, label: 'Material Escolar' }
  ];

  estadoConservacaoOptions = [
    { value: '', label: 'Todos os estados' },
    { value: EstadoConservacao.NOVO, label: 'Novo' },
    { value: EstadoConservacao.SEMI_NOVO, label: 'Semi-novo' },
    { value: EstadoConservacao.USADO_BOM, label: 'Usado em bom estado' },
    { value: EstadoConservacao.USADO_REGULAR, label: 'Usado em estado regular' }
  ];

  constructor(
    private itemService: ItemService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadItens();
  }

  loadItens(): void {
    this.loading = true;
    this.errorMessage = '';

    this.itemService.getItensDisponiveis().subscribe({
      next: (itens) => {
        this.itens = itens;
        this.filteredItens = itens;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao carregar itens';
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

      // Filtro por estado de conservação
      if (this.filtroEstado && item.estadoConservacao !== this.filtroEstado) {
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
    this.filtroEstado = '';
    this.buscaTexto = '';
    this.aplicarFiltros();
  }

  getTipoItemLabel(tipo: TipoItem): string {
    const option = this.tipoItemOptions.find(opt => opt.value === tipo);
    return option ? option.label : tipo;
  }

  getEstadoLabel(estado: EstadoConservacao): string {
    const option = this.estadoConservacaoOptions.find(opt => opt.value === estado);
    return option ? option.label : estado;
  }

  getStatusLabel(status: StatusItem): string {
    const statusLabels: { [key: string]: string } = {
      'DISPONIVEL': 'Disponível',
      'SOLICITADO': 'Solicitado',
      'RESERVADO': 'Reservado',
      'ENTREGUE': 'Entregue',
      'CANCELADO': 'Cancelado'
    };
    return statusLabels[status] || status;
  }

  formatarData(data: Date): string {
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  abrirModalSolicitacao(item: Item): void {
    this.selectedItem = item;
    this.modalVisible = true;
  }

  fecharModal(): void {
    this.modalVisible = false;
    this.selectedItem = null;
  }

  onSolicitacaoSuccess(): void {
    this.fecharModal();
    this.loadItens();
  }
}