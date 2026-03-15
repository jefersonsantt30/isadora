-- ============================================================
-- OBA CRM - Schema do Banco de Dados
-- Execute este SQL no editor SQL do Supabase
-- ============================================================

-- Tabela principal de crianças
CREATE TABLE criancas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  data_contato DATE,
  origem TEXT,
  idade INTEGER,
  serie TEXT,
  telefone TEXT,
  responsavel TEXT,
  estagiario TEXT,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'espera'
    CHECK (status IN ('espera','sem_serie','transferir','monitoria','concluida','desligada')),
  status_contato TEXT DEFAULT ''
    CHECK (status_contato IN ('','aguardando','sem_whatsapp','numero_errado','confirmado')),
  status_anamnese TEXT DEFAULT 'nao_iniciado'
    CHECK (status_anamnese IN ('nao_iniciado','agendada','realizada','pendente')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de histórico de contatos
CREATE TABLE historico_contatos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  crianca_id UUID REFERENCES criancas(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT NOT NULL CHECK (tipo IN ('ligacao','whatsapp','email','presencial','outro')),
  resultado TEXT NOT NULL CHECK (resultado IN ('atendeu','nao_atendeu','sem_whatsapp','mensagem_enviada','confirmado')),
  observacao TEXT,
  registrado_por TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_criancas_status ON criancas(status);
CREATE INDEX idx_criancas_nome ON criancas(nome);
CREATE INDEX idx_criancas_estagiario ON criancas(estagiario);
CREATE INDEX idx_historico_crianca ON historico_contatos(crianca_id);
CREATE INDEX idx_historico_data ON historico_contatos(data);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER criancas_updated_at
  BEFORE UPDATE ON criancas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS) - habilitar após testar
-- ALTER TABLE criancas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE historico_contatos ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- VERIFICAÇÃO: após rodar o script de seed, execute:
-- SELECT status, COUNT(*) FROM criancas GROUP BY status;
-- ============================================================
