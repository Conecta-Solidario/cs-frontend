import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'itens',
    loadComponent: () => import('./pages/itens/itens-list/itens-list.component').then(m => m.ItensListComponent)
  },
  {
    path: 'itens/cadastrar',
    loadComponent: () => import('./pages/itens/item-form/item-form.component').then(m => m.ItemFormComponent)
  },
  {
    path: 'solicitacoes',
    loadComponent: () => import('./pages/solicitacoes/solicitacoes-list/solicitacoes-list.component').then(m => m.SolicitacoesListComponent)
  },
  {
    path: 'doacoes',
    loadComponent: () => import('./pages/doacoes/doacoes-list/doacoes-list.component').then(m => m.DoacoesListComponent)
  }
];
