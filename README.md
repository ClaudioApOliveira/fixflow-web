# 🔧 FixFlow - Sistema de Gestão de Oficina Mecânica

Sistema completo para gestão de oficinas mecânicas com controle de ordens de serviço, agendamentos, orçamentos e dashboard analítico.

## 🚀 Tecnologias

- **Framework:** Next.js 16 (App Router + Turbopack)
- **Runtime:** Bun 1.3.5
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Estado:** TanStack Query (React Query)
- **Gráficos:** Chart.js + react-chartjs-2
- **Calendário:** react-big-calendar
- **Autenticação:** JWT Bearer Tokens

## 📋 Funcionalidades

### ✅ Implementado
- 🔐 **Autenticação** - Login com JWT e refresh tokens
- 📊 **Dashboard** - KPIs e gráficos interativos (receita, status, serviços)
- 📝 **Ordens de Serviço** - CRUD completo com 20 tipos de serviços
- 💰 **Sistema de Orçamentos** - Aprovação/recusa de orçamentos
- 📅 **Agendamentos** - Calendário interativo com disponibilidade de mecânicos
- 👥 **Clientes** - Cadastro e gerenciamento
- 🚗 **Veículos** - Vinculação com clientes
- 👤 **Usuários** - Controle de acesso (Admin, Mecânico, Atendente)
- 📄 **Documentação API** - Payloads completos em [`API_PAYLOADS.md`](./API_PAYLOADS.md)

## 🏁 Início Rápido

### Setup Automático (Recomendado)
```bash
./setup.sh
```

Isso irá instalar dependências, configurar Husky e formatar o código.

### Setup Manual

### 1️⃣ Instalar dependências
```bash
bun install
```

### 2️⃣ Configurar variáveis de ambiente
```bash
cp .env.local.example .env.local
# Edite .env.local se necessário
```

### 3️⃣ Iniciar o backend
⚠️ **IMPORTANTE:** O backend deve estar rodando na porta 8080

Veja instruções detalhadas em [`BACKEND_INTEGRATION.md`](./BACKEND_INTEGRATION.md)

### 4️⃣ Iniciar o frontend
```bash
bun dev
```

Acesse: **http://localhost:3000**

## 📁 Estrutura do Projeto

```
fixflow-web/
├── src/
│   ├── app/                    # Páginas (App Router)
│   │   ├── dashboard/          # Dashboard com KPIs e gráficos
│   │   ├── ordens/             # Listagem e detalhes de OS
│   │   ├── agendamentos/       # Calendário de agendamentos
│   │   ├── clientes/           # Gestão de clientes
│   │   ├── veiculos/           # Gestão de veículos
│   │   └── usuarios/           # Gestão de usuários
│   ├── components/
│   │   ├── charts/             # Gráficos Chart.js
│   │   ├── layout/             # Layout do dashboard
│   │   └── ui/                 # Componentes reutilizáveis
│   ├── lib/
│   │   ├── api.ts              # Cliente HTTP com interceptors
│   │   ├── auth.ts             # Lógica de autenticação
│   │   ├── hooks.ts            # React Query hooks
│   │   └── constants.ts        # Configurações globais
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── providers/              # Context Providers
├── API_PAYLOADS.md             # 📡 Documentação completa da API
├── BACKEND_INTEGRATION.md      # 🔌 Guia de integração backend
└── README.md                   # 📖 Este arquivo
```

## 🔌 Integração com Backend

O frontend espera que o backend esteja rodando em **`http://localhost:8080`**

### Erro: `ECONNREFUSED`?
```
Failed to proxy http://localhost:8080/ordens-servico Error: ECONNREFUSED
```

**Causa:** Backend não está rodando  
**Solução:** Veja [`BACKEND_INTEGRATION.md`](./BACKEND_INTEGRATION.md) para instruções detalhadas

### Endpoints Necessários
Todos os 20+ endpoints estão documentados em [`API_PAYLOADS.md`](./API_PAYLOADS.md):
- `/auth/login` - Autenticação
- `/ordens-servico` - CRUD de ordens
- `/servicos-os` - Serviços da OS
- `/agendamentos` - Sistema de agendamentos
- `/clientes`, `/veiculos`, `/usuarios` - CRUD básico

## 📊 Status dos Serviços

### Ordens de Serviço
- `ORCAMENTO` - Aguardando aprovação
- `ORCAMENTO_APROVADO` - Cliente aprovou
- `ORCAMENTO_RECUSADO` - Cliente recusou
- `PENDENTE` - Aguardando início
- `EM_ANDAMENTO` - Em execução
- `CONCLUIDO` - Finalizado
- `CANCELADO` - Cancelado

### Agendamentos
- `AGENDADO` - Novo agendamento
- `CONFIRMADO` - Cliente confirmou
- `EM_ATENDIMENTO` - Em atendimento
- `CONCLUIDO` - Finalizado
- `CANCELADO` - Cancelado
- `REAGENDADO` - Data alterada

## 🛠️ Tipos de Serviços Disponíveis

20 tipos de serviços automotivos:
- Troca de óleo e filtros
- Sistema de freios
- Alinhamento e balanceamento
- Revisão e manutenção
- Sistemas elétricos
- Ar condicionado
- E mais...

## 🧪 Scripts Disponíveis

```bash
bun dev          # Iniciar desenvolvimento
bun build        # Build de produção
bun start        # Iniciar produção
bun lint         # Linter ESLint
```

## 🎨 Componentes Customizados

- **NotebookTextarea** - Textarea estilizado com linhas de caderno
- **OrcamentoApproval** - UI para aprovar/recusar orçamentos
- **Calendar** - Calendário interativo com react-big-calendar
- **AgendamentoForm** - Formulário completo de agendamento
- **Charts** - Gráficos de receita, status e serviços

## 🔐 Autenticação

O sistema usa JWT com refresh tokens:
1. Login em `/login` retorna `accessToken` e `refreshToken`
2. Token armazenado no `localStorage`
3. Interceptor automático adiciona `Authorization: Bearer {token}`
4. Refresh automático quando token expira

**Credenciais de teste (configurar no backend):**
- Email: `claudio@gmail.com`
- Senha: `senha123`

## 📚 Documentação

- **[API_PAYLOADS.md](./API_PAYLOADS.md)** - Documentação completa de todos os endpoints
- **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)** - Guia de integração com backend

## 🐛 Troubleshooting

### Backend não conecta
Veja [`BACKEND_INTEGRATION.md`](./BACKEND_INTEGRATION.md) seção "Troubleshooting"

### Erro de CORS
Configure CORS no backend para aceitar `http://localhost:3000`

### Token inválido
Limpe o localStorage e faça login novamente

## 📞 Suporte

Para problemas de integração backend, consulte:
1. [`API_PAYLOADS.md`](./API_PAYLOADS.md) - Contratos da API
2. [`BACKEND_INTEGRATION.md`](./BACKEND_INTEGRATION.md) - Guia de integração
3. Logs do terminal do Next.js
4. Logs do backend

---

**Desenvolvido com ❤️ by Claudio de Oliveira**
