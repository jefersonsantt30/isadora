'use client'
import { useEffect, useState } from 'react'
import { supabase, Crianca } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { STATUS_CONFIG, diasNaLista, formatDate } from '@/lib/constants'
import { Users, AlertTriangle, ArrowRightLeft, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  espera: number
  sem_serie: number
  transferir: number
  monitoria: number
  concluida: number
  desligada: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ espera:0, sem_serie:0, transferir:0, monitoria:0, concluida:0, desligada:0 })
  const [alertas, setAlertas] = useState<Crianca[]>([])
  const [semRetorno, setSemRetorno] = useState<Crianca[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('criancas').select('*').order('data_contato', { ascending: true })
      if (!data) return
      const s: Stats = { espera:0, sem_serie:0, transferir:0, monitoria:0, concluida:0, desligada:0 }
      data.forEach((c: Crianca) => { if (c.status in s) s[c.status as keyof Stats]++ })
      setStats(s)

      // Alertas: precisa transferir + sem série
      const al = data.filter((c: Crianca) => c.status === 'transferir' || c.status === 'sem_serie')
      setAlertas(al)

      // Sem retorno há mais de 30 dias
      const sr = data.filter((c: Crianca) =>
        (c.status === 'espera' || c.status === 'monitoria') &&
        c.data_contato && diasNaLista(c.data_contato) > 30 &&
        (c.status_contato === 'aguardando' || c.status_contato === '')
      ).slice(0, 10)
      setSemRetorno(sr)

      setLoading(false)
    }
    load()
  }, [])

  const kpis = [
    { label: 'Lista de Espera',     value: stats.espera,    icon: Users,           color: 'text-blue-600',    bg: 'bg-blue-50',   border: 'border-blue-100', href: '/criancas' },
    { label: 'A Transferir',        value: stats.transferir + stats.sem_serie, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', href: '/alertas' },
    { label: 'Lista Monitoria',     value: stats.monitoria, icon: ArrowRightLeft,  color: 'text-violet-600',  bg: 'bg-violet-50', border: 'border-violet-100', href: '/monitoria' },
    { label: 'Avaliações Concluídas', value: stats.concluida, icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50',border: 'border-emerald-100', href: '/concluidas' },
    { label: 'Desligadas',          value: stats.desligada, icon: XCircle,         color: 'text-red-500',     bg: 'bg-red-50',    border: 'border-red-100', href: '/desligadas' },
    { label: 'Total no Sistema',    value: Object.values(stats).reduce((a,b)=>a+b,0), icon: TrendingUp, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100', href: '/criancas' },
  ]

  return (
    <div className="flex">
      <Sidebar />
      <main className="main-content p-8">
        {/* Header */}
        <div className="mb-8 fade-up">
          <h1 className="text-2xl font-bold text-gray-900" style={{fontFamily:'var(--font-display)'}}>Painel de Gestão</h1>
          <p className="text-gray-500 text-sm mt-1">Visão geral das crianças encaminhadas ao OBA</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {kpis.map((k, i) => (
            <Link key={k.label} href={k.href}
              className={`card p-5 flex items-center gap-4 hover:shadow-md transition-shadow fade-up fade-up-${Math.min(i+1,4)}`}>
              <div className={`w-12 h-12 rounded-xl ${k.bg} border ${k.border} flex items-center justify-center flex-shrink-0`}>
                <k.icon className={k.color} size={22} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${loading ? 'text-gray-200' : 'text-gray-900'}`}
                  style={{fontFamily:'var(--font-display)'}}>
                  {loading ? '—' : k.value}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{k.label}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Alertas */}
          <div className="card fade-up fade-up-3">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-orange-500" />
                <h2 className="font-semibold text-gray-800 text-sm">Ação Necessária</h2>
              </div>
              {alertas.length > 0 && <span className="alert-badge">{alertas.length}</span>}
            </div>
            <div className="divide-y divide-gray-50">
              {loading && <div className="px-5 py-8 text-center text-gray-400 text-sm">Carregando...</div>}
              {!loading && alertas.length === 0 && (
                <div className="px-5 py-8 text-center text-emerald-600 text-sm">✓ Nenhum alerta pendente</div>
              )}
              {alertas.slice(0,8).map(c => (
                <Link key={c.id} href={`/criancas/${c.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{c.nome}</div>
                    <div className="text-xs text-gray-400">{c.serie || 'Série não informada'} · {c.origem}</div>
                  </div>
                  <span className={`status-pill ${STATUS_CONFIG[c.status].bg} ${STATUS_CONFIG[c.status].color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[c.status].dot}`} />
                    {STATUS_CONFIG[c.status].label}
                  </span>
                </Link>
              ))}
              {alertas.length > 8 && (
                <Link href="/alertas" className="block px-5 py-3 text-center text-xs text-brand-600 hover:bg-gray-50">
                  Ver todos os {alertas.length} alertas →
                </Link>
              )}
            </div>
          </div>

          {/* Sem retorno há mais de 30 dias */}
          <div className="card fade-up fade-up-4">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <Clock size={16} className="text-amber-500" />
              <h2 className="font-semibold text-gray-800 text-sm">Sem Retorno +30 Dias</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {loading && <div className="px-5 py-8 text-center text-gray-400 text-sm">Carregando...</div>}
              {!loading && semRetorno.length === 0 && (
                <div className="px-5 py-8 text-center text-emerald-600 text-sm">✓ Todos os contatos em dia</div>
              )}
              {semRetorno.map(c => (
                <Link key={c.id} href={`/criancas/${c.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{c.nome}</div>
                    <div className="text-xs text-gray-400">{c.telefone}</div>
                  </div>
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    {diasNaLista(c.data_contato)} dias
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
