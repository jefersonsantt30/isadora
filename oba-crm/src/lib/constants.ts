import { Status, StatusContato, StatusAnamnese } from './supabase'

export const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; dot: string }> = {
  espera:     { label: 'Lista de Espera',   color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',    dot: 'bg-blue-500' },
  sem_serie:  { label: 'Série não informada', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200',  dot: 'bg-amber-400' },
  transferir: { label: 'Transferir → Monitoria', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500' },
  monitoria:  { label: 'Lista Monitoria',   color: 'text-violet-700',  bg: 'bg-violet-50 border-violet-200', dot: 'bg-violet-500' },
  concluida:  { label: 'Concluída',         color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  desligada:  { label: 'Desligada',         color: 'text-red-700',     bg: 'bg-red-50 border-red-200',      dot: 'bg-red-400' },
}

export const STATUS_CONTATO_CONFIG: Record<StatusContato, { label: string; color: string }> = {
  '':              { label: 'Não registrado',   color: 'text-gray-400' },
  aguardando:      { label: 'Aguardando retorno', color: 'text-amber-600' },
  sem_whatsapp:    { label: 'Sem WhatsApp',      color: 'text-gray-500' },
  numero_errado:   { label: 'Número errado',     color: 'text-red-600' },
  confirmado:      { label: 'Confirmado',        color: 'text-emerald-600' },
}

export const STATUS_ANAMNESE_CONFIG: Record<StatusAnamnese, { label: string; color: string }> = {
  nao_iniciado: { label: 'Não iniciado', color: 'text-gray-400' },
  agendada:     { label: 'Agendada',     color: 'text-blue-600' },
  realizada:    { label: 'Realizada',    color: 'text-emerald-600' },
  pendente:     { label: 'Pendente',     color: 'text-amber-600' },
}

export const TIPO_CONTATO_CONFIG = {
  ligacao:     { label: 'Ligação',    icon: '📞' },
  whatsapp:    { label: 'WhatsApp',   icon: '💬' },
  email:       { label: 'E-mail',     icon: '📧' },
  presencial:  { label: 'Presencial', icon: '🤝' },
  outro:       { label: 'Outro',      icon: '📝' },
}

export const RESULTADO_CONTATO_CONFIG = {
  atendeu:          { label: 'Atendeu',           color: 'text-emerald-600' },
  nao_atendeu:      { label: 'Não atendeu',        color: 'text-red-500' },
  sem_whatsapp:     { label: 'Sem WhatsApp',        color: 'text-gray-500' },
  mensagem_enviada: { label: 'Mensagem enviada',    color: 'text-blue-600' },
  confirmado:       { label: 'Confirmado',          color: 'text-emerald-700' },
}

export function diasNaLista(dataContato: string | null): number {
  if (!dataContato) return 0
  const diff = Date.now() - new Date(dataContato).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function formatDate(date: string | null): string {
  if (!date) return '—'
  const [y, m, d] = date.split('-')
  return `${d}/${m}/${y}`
}

export function serieNumero(serie: string): number {
  if (!serie) return 99
  const n = parseInt(serie[0])
  return isNaN(n) ? 99 : n
}

export function elegibilidade(serie: string): 'apta' | 'transferir' | 'verificar' {
  const n = serieNumero(serie)
  if (n === 99) return 'verificar'
  if (n <= 5) return 'apta'
  return 'transferir'
}
