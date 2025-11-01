import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitacaoService } from '../../services/solicitacao.service';
import { AuthService } from '../../services/auth.service';
import { SolicitacaoCreateRequest } from '../../models/solicitacao.model';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-solicitar-item-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitar-item-modal.component.html',
  styleUrl: './solicitar-item-modal.component.css'
})
export class SolicitarItemModalComponent implements OnInit, OnChanges {
  @Input() item: Item | null = null;
  @Input() visible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  solicitacaoData: SolicitacaoCreateRequest = {
    itemId: 0,
    quantidadeSolicitada: 1,
    motivo: '',
    observacoes: ''
  };

  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private solicitacaoService: SolicitacaoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.item) {
      this.solicitacaoData.itemId = this.item.id;
      this.solicitacaoData.quantidadeSolicitada = Math.min(1, this.item.quantidade);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.item && this.visible) {
      this.solicitacaoData.itemId = this.item.id;
      this.solicitacaoData.quantidadeSolicitada = Math.min(1, this.item.quantidade);
      this.solicitacaoData.motivo = '';
      this.solicitacaoData.observacoes = '';
      this.errorMessage = '';
    }
  }

  get quantidadeMaxima(): number {
    return this.item?.quantidade || 1;
  }

  onSubmit(): void {
    this.errorMessage = '';
    
    if (!this.solicitacaoData.motivo.trim()) {
      this.errorMessage = 'O motivo da solicitação é obrigatório';
      return;
    }

    if (this.solicitacaoData.quantidadeSolicitada <= 0) {
      this.errorMessage = 'A quantidade deve ser maior que zero';
      return;
    }

    if (this.solicitacaoData.quantidadeSolicitada > this.quantidadeMaxima) {
      this.errorMessage = `A quantidade solicitada não pode ser maior que ${this.quantidadeMaxima}`;
      return;
    }

    this.loading = true;

    this.solicitacaoService.createSolicitacao(this.solicitacaoData).subscribe({
      next: () => {
        this.success.emit();
        this.closeModal();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao criar solicitação';
        this.loading = false;
      }
    });
  }

  closeModal(): void {
    this.visible = false;
    this.errorMessage = '';
    this.close.emit();
  }
}
