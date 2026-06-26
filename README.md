# MyAgenda

A personal task manager built for focus and clarity. Organize tasks across projects, track due dates, and switch between List, Board, and Agenda views.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS · Supabase · Radix UI

---

## English

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A [Supabase](https://supabase.com) account (free tier works)
- A [Vercel](https://vercel.com) account (for deployment, optional)

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/myagenda-app.git
cd myagenda-app
```

---

### 2. Set up Supabase

#### 2.1 Create a project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to finish provisioning

#### 2.2 Run the database schema
1. In the Supabase dashboard, go to **SQL Editor**
2. Open the file `supabase-setup.sql` from this repo
3. Paste the contents and click **Run**

This creates the `tasks` and `projects` tables with Row Level Security enabled.

#### 2.3 Enable Magic Link auth
1. Go to **Authentication → Providers**
2. Make sure **Email** is enabled
3. Go to **Authentication → URL Configuration**
4. Add your local URL to **Redirect URLs**: `http://localhost:5173`
   - For production, also add your Vercel URL: `https://your-app.vercel.app`

#### 2.4 Get your API keys
1. Go to **Project Settings → API**
2. Copy the **Project URL** and the **anon / public** key

---

### 3. Configure environment variables

Create a `.env` file in the root of the project:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> The `.env` file is gitignored and will never be committed.

---

### 4. Install dependencies and run locally

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

### 5. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New → Project**
3. Import your GitHub repository
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**

After deploying, go back to Supabase → **Authentication → URL Configuration** and add your Vercel URL to **Redirect URLs**.

Every `git push` to `main` will trigger an automatic redeploy.

---

---

## Português

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- Uma conta no [Supabase](https://supabase.com) (o plano gratuito funciona)
- Uma conta no [Vercel](https://vercel.com) (para deploy, opcional)

---

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/myagenda-app.git
cd myagenda-app
```

---

### 2. Configure o Supabase

#### 2.1 Crie um projeto
1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Aguarde o banco de dados terminar de ser provisionado

#### 2.2 Execute o schema do banco de dados
1. No painel do Supabase, vá em **SQL Editor**
2. Abra o arquivo `supabase-setup.sql` deste repositório
3. Cole o conteúdo e clique em **Run**

Isso cria as tabelas `tasks` e `projects` com Row Level Security ativado.

#### 2.3 Ative o login por Magic Link
1. Vá em **Authentication → Providers**
2. Certifique-se de que **Email** está habilitado
3. Vá em **Authentication → URL Configuration**
4. Adicione sua URL local em **Redirect URLs**: `http://localhost:5173`
   - Em produção, adicione também a URL do Vercel: `https://seu-app.vercel.app`

#### 2.4 Obtenha as chaves de API
1. Vá em **Project Settings → API**
2. Copie a **Project URL** e a chave **anon / public**

---

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

> O arquivo `.env` está no `.gitignore` e nunca será enviado ao repositório.

---

### 4. Instale as dependências e rode localmente

```bash
npm install
npm run dev
```

O app estará disponível em `http://localhost:5173`.

---

### 5. Deploy no Vercel

1. Suba seu código para o GitHub
2. Acesse [vercel.com](https://vercel.com) → **Add New → Project**
3. Importe o repositório do GitHub
4. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Clique em **Deploy**

Após o deploy, volte ao Supabase → **Authentication → URL Configuration** e adicione a URL do Vercel em **Redirect URLs**.

A cada `git push` para a branch `main`, o Vercel fará o redeploy automaticamente.
