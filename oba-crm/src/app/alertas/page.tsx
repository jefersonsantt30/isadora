'use client'
import { useEffect, useState } from 'react'
import { supabase, Crianca } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { STATUS_CONFIG, formatDate, diasNaLista } from '@/lib/constants'
import { AlertTriangle, ChevronRight, ArrowRightLeft, HelpCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default function Alertas() {
  const [transferir, setTransferir] = useState<Crianca[]>([])
  const [semSerie, setSemSerie] = useState<Crianca[]>([])
  const [semRetorno, setSemRetorno] = useState<Crianca[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('criancas').select('*')
        .in('status', ['espera','sem_serie','transferir','monitoria'])
        .order('data_contato', { ascending: true })
      if (!data) return
      setTransferir(data.filter((c: Crianca) => c.status === 'transferir'))
      setSemSerie(data.filter((c: Crianca) => c.status === 'sem_serie'))
      setSemRetorno(data.filter((c: Crianca) =>
        diasNaLista(c.data_contato) > 30 &&
        (c.status_contato === '' || c.status_contato === 'aguardando')
      ))
      setLoading(false)
    }
    load()
  }, [])

  async function transferirParaMonitoria(id: string) {
    await supabase.from('criancas').update({ status: 'monitoria' }).eq('id', id)
    setTransferir(prev => prev.filter(c => c.id !== id))
  }

  const Section = ({ icon: Icon, title, color, count, children }: any) => (
    <div className="card mb-6 overflow-hidden fade-up">
      <div className={`flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 ${color}`}>
        <Icon size={16} className="text-white" />
        <h2 className="font-semibold text-white text-sm">{title}</h2>
        {count > 0 && <span className="ml-auto bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>}
      </div>
      {children}
    </div>
  )

  const EmptyState = ({ msg }: { msg: string }) => (
    <div className="px-5 py-8 text-center text-emerald-600 text-sm">✓ {msg}</div>
  )

  return (
    <div className="flex">
      <Sidebar />
      <main className="main-content p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900" style={{fontFamily:'var(--font-display)'}}>Alertas</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? '—' : transferir.length + semSerie.length + semRetorno.length} ações pendentes
          </p>
        </div>

        {/* Transferir para monitoria */}
        <Section icon={ArrowRightLeft} title="Transferir para Monitoria (6ª série ou acima)" color="bg-orange-500" count={transferir.length}>
          {loading && <div className="px-5 py-8 text-center text-gray-400 text-sm">Carregando...</div>}
          {!loading && transferir.length === 0 && <EmptyState msg="Nenhuma criança a transferir" />}
          <div className="divide-y divide-gray-50">
            {transferir.map(c => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 text-sm">{c.nome}</div>
                  <div className="text-xs text-gray-400">{c.serie} · {c.origem} · {c.telefone}</div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => transferirParaMonitoria(c.id)}
                    className="text-xs px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg font-medium hover:bg-violet-200 transition-colors">
                    Transferir agora
                  </button>
                  <Link href={`/criancas/${c.id}`} className="text-gray-400 hover:text-gray-700">
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Sem série */}
        <Section icon={HelpCircle} title="Série não informada — verificar" color="bg-amber-500" count={semSerie.length}>
          {loading && <div className="px-5 py-8 text-center text-gray-400 text-sm">Carregando...</div>}
          {!loading && semSerie.length === 0 && <EmptyState msg="Todas as séries preenchidas" />}
          <div className="divide-y divide-gray-50">
            {semSerie.map(c => (
              <Link key={c.id} href={`/criancas/${c.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="font-medium text-gray-800 text-sm">{c.nome}</div>
                  <div className="text-xs text-gray-400">{c.origem} · {formatDate(c.data_contato)}</div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </Link>
            ))}
          </div>
        </Section>

        {/* Sem retorno */}
        <Section icon={Clock} title="Sem retorno há mais de 30 dias" color="bg-blue-600" count={semRetorno.length}>
          {loading && <div className="px-5 py-8 text-center text-gray-400 text-sm">Carregando...</div>}
          {!loading && semRetorno.length === 0 && <EmptyState msg="Todos os contatos em dia" />}
          <div className="divide-y divide-gray-50">
            {semRetorno.map(c => (
              <Link key={c.id} href={`/criancas/${c.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="font-medium text-gray-800 text-sm">{c.nome}</div>
                  <div className="text-xs text-gray-400">{c.telefone} · {c.origem}</div>
                </div>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full ml-4 flex-shrink-0">
                  {diasNaLista(c.data_contato)} dias
                </span>
              </Link>
            ))}
          </div>
        </Section>
      </main>
    </div>
  )
}
