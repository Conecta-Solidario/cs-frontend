# Conecta Solidário - Front-end

Plataforma web destinada a conectar doadores e receptores de recursos essenciais, como alimentos, roupas e materiais escolares.

## Tecnologias

- Angular 17
- TypeScript
- CSS

## Funcionalidades

### ✅ Implementadas

1. **Autenticação de Usuários**
   - Login e registro seguro
   - Suporte para doadores e receptores
   - Dados mockados

### 🚧 Em Desenvolvimento

2. Cadastro de Itens para Doação
3. Visualização de Itens Disponíveis
4. Solicitação de Recursos
5. Gerenciamento de Doações
6. Controle de Requisições

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Execute o servidor de desenvolvimento:
```bash
npm start
```

3. Acesse a aplicação em: `http://localhost:4200`

## Contas de Demonstração

### Doador
- Email: `joao@example.com`
- Senha: `123456`

### Receptor
- Email: `maria@example.com`
- Senha: `123456`

## Estrutura do Projeto

```
src/
├── app/
│   ├── components/        # Componentes reutilizáveis
│   ├── models/            # Modelos de dados
│   ├── pages/             # Páginas da aplicação
│   ├── services/         # Serviços (lógica de negócio e APIs mockadas)
│   ├── app.component.*   # Componente raiz
│   ├── app.config.ts     # Configuração da aplicação
│   └── app.routes.ts     # Rotas da aplicação
├── assets/               # Arquivos estáticos
├── index.html            # HTML principal
├── main.ts               # Ponto de entrada
└── styles.css            # Estilos globais
```

## Observações

- Todas as chamadas para o backend estão mockadas, pois o backend em Java ainda não foi desenvolvido.
- Os dados são armazenados apenas em memória (não persistem após reload da página, exceto para autenticação que usa localStorage).