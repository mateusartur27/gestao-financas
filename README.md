# 💰 Gestão de Finanças

Ferramenta web para gerenciar recebimentos mensais, com dashboard e relatórios.

## Stack

| Camada    | Tecnologia                     |
| --------- | ------------------------------ |
| Frontend  | Next.js 15 + React + TypeScript |
| Estilos   | Tailwind CSS                   |
| Backend   | Supabase (Auth + PostgreSQL)   |
| Gráficos  | Recharts                       |
| Hosting   | Cloudflare Pages               |

## Funcionalidades

- ✅ **Login / Cadastro** com Supabase Auth
- 📋 **Recebimentos** — listagem mês a mês com navegação
- ➕ Adicionar recebimento com data (pré-preenchida com hoje), valor e descrição
- ✔️ Marcar como recebido (exibe data de pagamento)
- ✏️ Editar e excluir lançamentos
- 📊 **Dashboard** com:
  - Total do mês / Já recebido / A receber / Em atraso
  - Gráfico de barras dos últimos 6 meses
  - Lista de recebimentos em atraso

## Setup local

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/gestao-financas.git
cd gestao-financas
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Copie `.env.local.example` para `.env.local` e preencha:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. No painel do Supabase, vá em **SQL Editor** e execute o arquivo:

```
supabase/migrations/001_initial.sql
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3000`

## Deploy — Cloudflare Pages

1. Faça push para o GitHub
2. No painel Cloudflare → **Pages** → **Create a project** → conecte o repositório
3. Configure:
   - **Build command:** `npm run build`
   - **Output directory:** `out`
   - **Node version:** `20`
4. Adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Estrutura do projeto

```
src/
├── app/
│   ├── (auth)/login/        # Página de login
│   ├── (auth)/register/     # Página de cadastro
│   ├── (app)/dashboard/     # Dashboard com relatórios
│   └── (app)/recebimentos/  # Lista de recebimentos
├── components/
│   ├── Navbar.tsx
│   ├── ReceivableForm.tsx   # Modal de criação/edição
│   ├── ReceivableList.tsx   # Lista com toggle de pago
│   ├── DashboardStats.tsx   # Cards de métricas
│   └── MonthlyChart.tsx     # Gráfico de barras
├── hooks/
│   └── useReceivables.ts    # CRUD + estado
├── lib/
│   ├── supabase/client.ts
│   └── utils.ts
└── types/index.ts
```
