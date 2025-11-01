import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, delay, throwError } from 'rxjs';
import { Usuario, LoginRequest, RegisterRequest, AuthResponse, TipoUsuario } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: Usuario | null = null;
  private token: string | null = null;
  private readonly STORAGE_KEY = 'conecta_solidario_user';
  private readonly TOKEN_KEY = 'conecta_solidario_token';

  // Dados mockados de usuários
  private mockUsers: Usuario[] = [
    {
      id: 1,
      nome: 'João Silva',
      email: 'joao@example.com',
      senha: '123456',
      tipo: TipoUsuario.DOADOR,
      telefone: '(11) 99999-9999',
      endereco: 'Rua das Flores, 123',
      ativo: true
    },
    {
      id: 2,
      nome: 'Maria Santos',
      email: 'maria@example.com',
      senha: '123456',
      tipo: TipoUsuario.RECEPTOR,
      telefone: '(11) 88888-8888',
      endereco: 'Av. Principal, 456',
      ativo: true
    }
  ];

  constructor(private router: Router) {
    // Carregar usuário do localStorage ao iniciar
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const user = this.mockUsers.find(
      u => u.email === credentials.email && u.senha === credentials.senha && u.ativo
    );

    if (!user) {
      return throwError(() => new Error('Email ou senha inválidos'));
    }

    // Remover senha do objeto retornado
    const { senha, ...userWithoutPassword } = user;
    
    const token = this.generateToken();
    const response: AuthResponse = {
      token,
      usuario: { ...userWithoutPassword } as Usuario
    };

    this.currentUser = user;
    this.token = token;
    this.saveUserToStorage();

    return of(response).pipe(delay(500)); // Simular delay de rede
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    // Verificar se email já existe
    const emailExists = this.mockUsers.some(u => u.email === data.email);
    if (emailExists) {
      return throwError(() => new Error('Email já cadastrado'));
    }

    // Criar novo usuário
    const newUser: Usuario = {
      id: this.mockUsers.length + 1,
      nome: data.nome,
      email: data.email,
      senha: data.senha,
      tipo: data.tipo,
      telefone: data.telefone,
      endereco: data.endereco,
      ativo: true
    };

    this.mockUsers.push(newUser);

    const { senha, ...userWithoutPassword } = newUser;
    const token = this.generateToken();
    const response: AuthResponse = {
      token,
      usuario: { ...userWithoutPassword } as Usuario
    };

    this.currentUser = newUser;
    this.token = token;
    this.saveUserToStorage();

    return of(response).pipe(delay(500));
  }

  logout(): void {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/home']);
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUser(): Usuario | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return this.token;
  }

  isDoador(): boolean {
    return this.currentUser?.tipo === TipoUsuario.DOADOR;
  }

  isReceptor(): boolean {
    return this.currentUser?.tipo === TipoUsuario.RECEPTOR;
  }

  private generateToken(): string {
    return 'mock_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private saveUserToStorage(): void {
    if (this.currentUser && this.token) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUser));
      localStorage.setItem(this.TOKEN_KEY, this.token);
    }
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem(this.STORAGE_KEY);
    const token = localStorage.getItem(this.TOKEN_KEY);
    
    if (userStr && token) {
      try {
        this.currentUser = JSON.parse(userStr);
        this.token = token;
      } catch (e) {
        console.error('Erro ao carregar usuário do storage:', e);
        this.logout();
      }
    }
  }
}
