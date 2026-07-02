# MyAgenda

A personal task manager built for focus and clarity. Organize tasks across projects and subprojects, track due dates, add descriptions and solution notes, and switch between List, Board, and Agenda views.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS · Supabase · Radix UI

---

## English

### Features

- **Magic Link auth** — passwordless sign-in via email
- **Projects & subprojects** — one level of nesting; parent projects roll up tasks from all children
- **Three views** — List (grouped by priority), Board (Kanban), Agenda (grouped by due date)
- **Task detail modal** — autosaves as you type; edit title, description, solution notes, priority, category, status, and due date
- **Image attachments** — attach images to description and solution fields, stored privately in Supabase Storage
- **Drag-and-drop** — reorder tasks between Kanban columns
- **Dark / light theme**
- **English / Portuguese UI**

---

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
2. Open `supabase-setup.sql` from this repo
3. Paste the contents and click **Run**

This creates the `tasks` and `projects` tables with Row Level Security enabled.

#### 2.3 Create the storage bucket for task images
1. Go to **Storage → New bucket**
2. Name it `task-images`
3. Leave **Public bucket disabled** (images are private — only the authenticated owner can access them)
4. Click **Save**

#### 2.4 Add storage policies
Images are protected by Row Level Security. You need to add three policies so users can upload, view, and delete only their own images.

Go to **Storage → Policies → New policy** on the `task-images` bucket. For each policy, click **"For full customization"** and fill in the fields below.

---

**Policy 1 — Upload (INSERT)**
- Policy name: `owner can upload`
- Allowed operation: `INSERT`
- WITH CHECK expression:
```sql
bucket_id = 'task-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

---

**Policy 2 — View (SELECT)**
- Policy name: `owner can view`
- Allowed operation: `SELECT`
- USING expression:
```sql
bucket_id = 'task-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

---

**Policy 3 — Delete (DELETE)**
- Policy name: `owner can delete`
- Allowed operation: `DELETE`
- USING expression:
```sql
bucket_id = 'task-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

---

> All three policies use the same logic: the first segment of the file path (`user_id/task_id/file.jpg`) must match the logged-in user's `uid`. No one else can see or touch your images.

#### 2.5 Enable Magic Link auth
1. Go to **Authentication → Providers**
2. Make sure **Email** is enabled
3. Go to **Authentication → URL Configuration**
4. Add your local URL to **Redirect URLs**: `http://localhost:5173`
   - For production, also add your Vercel URL: `https://your-app.vercel.app`

#### 2.6 Get your API keys
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

### Funcionalidades

- **Login por Magic Link** — autenticação sem senha via e-mail
- **Projetos e subprojetos** — um nível de aninhamento; projetos pai agregam tarefas de todos os filhos
- **Três visualizações** — Lista (agrupada por prioridade), Quadro (Kanban), Agenda (agrupada por prazo)
- **Modal de detalhes da tarefa** — salva automaticamente enquanto você digita; edite título, descrição, notas de solução, prioridade, categoria, status e prazo
- **Anexos de imagem** — adicione imagens à descrição e ao campo de solução, armazenadas de forma privada no Supabase Storage
- **Arrastar e soltar** — reorganize tarefas entre colunas do Kanban
- **Tema escuro / claro**
- **Interface em Inglês / Português**

---

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

#### 2.3 Crie o bucket de armazenamento para imagens
1. Vá em **Storage → New bucket**
2. Nomeie como `task-images`
3. Deixe o **Public bucket desativado** (as imagens são privadas — só o dono autenticado pode acessá-las)
4. Clique em **Save**

#### 2.4 Adicione as políticas de armazenamento
As imagens são protegidas por Row Level Security. Você precisa adicionar três políticas para que os usuários possam fazer upload, visualizar e deletar apenas as próprias imagens.

Vá em **Storage → Policies → New policy** no bucket `task-images`. Em cada política, clique em **"For full customization"** e preencha os campos abaixo.

---

**Política 1 — Upload (INSERT)**
- Policy name: `owner can upload`
- Allowed operation: `INSERT`
- WITH CHECK expression:
```sql
bucket_id = 'task-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

---

**Política 2 — Visualizar (SELECT)**
- Policy name: `owner can view`
- Allowed operation: `SELECT`
- USING expression:
```sql
bucket_id = 'task-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

---

**Política 3 — Deletar (DELETE)**
- Policy name: `owner can delete`
- Allowed operation: `DELETE`
- USING expression:
```sql
bucket_id = 'task-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

---

> As três políticas usam a mesma lógica: o primeiro segmento do caminho do arquivo (`user_id/task_id/arquivo.jpg`) precisa bater com o `uid` do usuário logado. Ninguém além de você acessa suas imagens.

#### 2.5 Ative o login por Magic Link
1. Vá em **Authentication → Providers**
2. Certifique-se de que **Email** está habilitado
3. Vá em **Authentication → URL Configuration**
4. Adicione sua URL local em **Redirect URLs**: `http://localhost:5173`
   - Em produção, adicione também a URL do Vercel: `https://seu-app.vercel.app`

#### 2.6 Obtenha as chaves de API
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
