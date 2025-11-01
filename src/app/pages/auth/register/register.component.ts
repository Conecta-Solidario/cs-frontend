import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RegisterRequest, TipoUsuario } from '../../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerData: RegisterRequest = {
    nome: '',
    email: '',
    senha: '',
    tipo: TipoUsuario.DOADOR,
    telefone: '',
    endereco: ''
  };

  confirmSenha: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  tipoUsuarioOptions = [
    { value: TipoUsuario.DOADOR, label: 'Doador' },
    { value: TipoUsuario.RECEPTOR, label: 'Receptor (Família/ONG)' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerData.senha !== this.confirmSenha) {
      this.errorMessage = 'As senhas não coincidem';
      return;
    }

    if (this.registerData.senha.length < 6) {
      this.errorMessage = 'A senha deve ter pelo menos 6 caracteres';
      return;
    }

    this.loading = true;

    this.authService.register(this.registerData).subscribe({
      next: () => {
        this.successMessage = 'Cadastro realizado com sucesso! Redirecionando...';
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao realizar cadastro';
        this.loading = false;
      }
    });
  }
}
