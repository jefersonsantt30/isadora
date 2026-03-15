# OBA CRM — Gestão de Avaliações Psicológicas

Sistema de gestão de crianças encaminhadas ao OBA para avaliação psicológica.

## Stack
- **Next.js 14** (App Router)
- **Supabase** (banco de dados PostgreSQL)
- **Tailwind CSS**
- **Vercel** (hospedagem)

---

## 🚀 Deploy em 5 Passos

### 1. Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com) e abra seu projeto
2. Vá em **SQL Editor**
3. Cole e execute o conteúdo de `supabase/schema.sql`
4. Cole e execute o conteúdo de `supabase/seed.sql` (importa os 451 registros da planilha)

### 2. Subir para o GitHub

```bash
git init
git add .
git commit -m "OBA CRM inicial"
git remote add origin https://github.com/SEU_USUARIO/oba-crm.git
git push -u origin main
```

### 3. Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **Add New → Project**
3. Importe o repositório GitHub
4. Em **Environment Variables**, adicione:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://rbirpkpiliqvwawffdqj.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_rIs_aATwe47gEVRv8WKbdg_Klv5-H6T
   ```
5. Clique em **Deploy**

Pronto! O sistema estará disponível em `https://oba-crm.vercel.app`

---

## 🏗️ Rodar Localmente

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.local.example .env.local
# Editar .env.local com suas credenciais

# Rodar em desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

---

## 📋 Funcionalidades

| Página | Descrição |
|--------|-----------|
| `/` | Painel com KPIs e alertas automáticos |
| `/criancas` | Lista de espera com busca e filtros |
| `/criancas/[id]` | Perfil completo + histórico de contatos |
| `/monitoria` | Lista de monitoria (6ª série+) |
| `/concluidas` | Avaliações concluídas |
| `/desligadas` | Desistentes e desligadas |
| `/agendamentos` | Agenda semanal por estagiário |
| `/alertas` | Ações urgentes pendentes |

## 🔄 Regra de Elegibilidade

- **Até 5ª série** → Lista de Espera (avaliação OBA)
- **6ª série ou acima** → Lista Monitoria
- **Série não informada** → Alerta para verificação

---

## 📊 Dados Importados da Planilha

| Status | Quantidade |
|--------|-----------|
| Lista de Espera | 168 |
| Série não informada | 31 |
| A transferir para Monitoria | 3 |
| Lista Monitoria | 80 |
| Avaliações Concluídas | 36 |
| Desligadas/Desistentes | 133 |
| **Total** | **451** |
