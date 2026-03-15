import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Status = 'espera' | 'sem_serie' | 'transferir' | 'monitoria' | 'concluida' | 'desligada'
export type StatusContato = '' | 'aguardando' | 'sem_whatsapp' | 'numero_errado' | 'confirmado'
export type StatusAnamnese = 'nao_iniciado' | 'agendada' | 'realizada' | 'pendente'
export type TipoContato = 'ligacao' | 'whatsapp' | 'email' | 'presencial' | 'outro'
export type ResultadoContato = 'atendeu' | 'nao_atendeu' | 'sem_whatsapp' | 'mensagem_enviada' | 'confirmado'

export interface Crianca {
  id: string
  nome: string
  data_contato: string | null
  origem: string
  idade: number | null
  serie: string
  telefone: string
  responsavel: string
  estagiario: string
  observacoes: string
  status: Status
  status_contato: StatusContato
  status_anamnese: StatusAnamnese
  created_at: string
  updated_at: string
}

export interface HistoricoContato {
  id: string
  crianca_id: string
  data: string
  tipo: TipoContato
  resultado: ResultadoContato
  observacao: string
  registrado_por: string
  created_at: string
}
