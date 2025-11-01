import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SolicitacaoService } from '../../../services/solicitacao.service';
import { AuthService } from '../../../services/auth.service';
import { Solicitacao, StatusSolicitacao } from '../../../models/solicitacao.model';

@Component({
  selector: 'app-solicitacoes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './solicitacoes-list.component.html',
  styleUrl: './solicitacoes-list.component.css'
})
export class SolicitacoesListComponent implements OnInit {
  solicitacoes: Solicitacao[] = [];
  filteredSolicitacoes: Solicitacao[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Filtros
  filtroStatus: StatusSolicitacao | '' = '';

  statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: StatusSolicitacao.PENDENTE, label: 'Pendente' },
    { value: StatusSolicitacao.APROVADA, label: 'Aprovada' },
    { value: StatusSolicitacao.REJEITADA, label: 'Rejeitada' },
    { value: StatusSolicitacao.ENTREGUE, label: 'Entregue' },
    { value: StatusSolicitacao.CANCELADA, label: 'Cancelada' }
  ];

  constructor(
    private solicitacaoService: SolicitacaoService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadSolicitacoes();
  }

  loadSolicitacoes(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage = 'Usuário não autenticado';
      this.loading = false;
      return;
    }

    let request: any;
    if (currentUser.tipo === 'RECEPTOR') {
      request = this.solicitacaoService.getSolicitacoesByReceptor(currentUser.id);
    } else if (currentUser.tipo === 'DOADOR') {
      request = this.solicitacaoService.getSolicitacoesByDoador(currentUser.id);
    } else {
      request = this.solicitacaoService.getAllSolicitacoes();
    }

    request.subscribe({
      next: (solicitacoes: Solicitacao[]) => {
        this.solicitacoes = solicitacoes;
        this.filteredSolicitacoes = solicitacoes;
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'Erro ao carregar solicitações';
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.filteredSolicitacoes = this.solicitacoes.filter(solicitacao => {
      if (this.filtroStatus && solicitacao.status !== this.filtroStatus) {
        return false;
      }
      return true;
    });
  }

  limparFiltros(): void {
    this.filtroStatus = '';
    this.aplicarFiltros();
  }

  getStatusLabel(status: StatusSolicitacao): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  }

  getStatusClass(status: StatusSolicitacao): string {
    const classes: { [key: string]: string } = {
      'PENDENTE': 'badge-pendente',
      'APROVADA': 'badge-aprovada',
      'REJEITADA': 'badge-rejeitada',
      'ENTREGUE': 'badge-entregue',
      'CANCELADA': 'badge-cancelada'
    };
    return classes[status] || 'badge-default';
  }

  formatarData(data: Date): string {
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  aprovarSolicitacao(id: number): void {
    this.updateStatus(id, StatusSolicitacao.APROVADA);
  }

  rejeitarSolicitacao(id: number): void {
    this.updateStatus(id, StatusSolicitacao.REJEITADA);
  }

  marcarEntregue(id: number): void {
    this.updateStatus(id, StatusSolicitacao.ENTREGUE);
  }

  cancelarSolicitacao(id: number): void {
    this.solicitacaoService.cancelSolicitacao(id).subscribe({
      next: () => {
        this.successMessage = 'Solicitação cancelada com sucesso';
        this.loadSolicitacoes();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao cancelar solicitação';
      }
    });
  }

  private updateStatus(id: number, status: StatusSolicitacao): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.solicitacaoService.updateSolicitacao(id, { status }).subscribe({
      next: () => {
        const statusLabel = this.getStatusLabel(status);
        this.successMessage = `Solicitação ${statusLabel.toLowerCase()} com sucesso`;
        this.loadSolicitacoes();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao atualizar solicitação';
      }
    });
  }

  podeCancelar(solicitacao: Solicitacao): boolean {
    return this.authService.isReceptor() && 
           solicitacao.status === StatusSolicitacao.PENDENTE &&
           solicitacao.receptorId === this.authService.getCurrentUser()?.id;
  }

  podeAprovar(solicitacao: Solicitacao): boolean {
    return this.authService.isDoador() && 
           solicitacao.status === StatusSolicitacao.PENDENTE &&
           solicitacao.doadorId === this.authService.getCurrentUser()?.id;
  }

  podeRejeitar(solicitacao: Solicitacao): boolean {
    return this.authService.isDoador() && 
           solicitacao.status === StatusSolicitacao.PENDENTE &&
           solicitacao.doadorId === this.authService.getCurrentUser()?.id;
  }

  podeMarcarEntregue(solicitacao: Solicitacao): boolean {
    return this.authService.isDoador() && 
           solicitacao.status === StatusSolicitacao.APROVADA &&
           solicitacao.doadorId === this.authService.getCurrentUser()?.id;
  }
}