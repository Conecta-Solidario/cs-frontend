import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ItemService } from '../../../services/item.service';
import { AuthService } from '../../../services/auth.service';
import { ItemCreateRequest, TipoItem, EstadoConservacao } from '../../../models/item.model';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.css'
})
export class ItemFormComponent implements OnInit {
  itemData: ItemCreateRequest = {
    nome: '',
    descricao: '',
    tipo: TipoItem.ALIMENTO,
    quantidade: 1,
    estadoConservacao: EstadoConservacao.NOVO,
    foto: ''
  };

  tipoItemOptions = [
    { value: TipoItem.ALIMENTO, label: 'Alimento' },
    { value: TipoItem.ROUPA, label: 'Roupa' },
    { value: TipoItem.MATERIAL_ESCOLAR, label: 'Material Escolar' }
  ];

  estadoConservacaoOptions = [
    { value: EstadoConservacao.NOVO, label: 'Novo' },
    { value: EstadoConservacao.SEMI_NOVO, label: 'Semi-novo' },
    { value: EstadoConservacao.USADO_BOM, label: 'Usado em bom estado' },
    { value: EstadoConservacao.USADO_REGULAR, label: 'Usado em estado regular' }
  ];

  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(
    private itemService: ItemService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar se o usuário está autenticado e é doador
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.authService.isDoador()) {
      this.errorMessage = 'Apenas doadores podem cadastrar itens';
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    // Validações básicas
    if (!this.itemData.nome.trim()) {
      this.errorMessage = 'O nome do item é obrigatório';
      this.loading = false;
      return;
    }

    if (!this.itemData.descricao.trim()) {
      this.errorMessage = 'A descrição do item é obrigatória';
      this.loading = false;
      return;
    }

    if (this.itemData.quantidade <= 0) {
      this.errorMessage = 'A quantidade deve ser maior que zero';
      this.loading = false;
      return;
    }

    this.itemService.createItem(this.itemData).subscribe({
      next: () => {
        this.successMessage = 'Item cadastrado com sucesso!';
        setTimeout(() => {
          this.router.navigate(['/itens']);
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao cadastrar item';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/itens']);
  }
}