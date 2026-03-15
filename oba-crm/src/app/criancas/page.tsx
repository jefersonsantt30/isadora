'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase, Crianca, Status } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { STATUS_CONFIG, formatDate, diasNaLista } from '@/lib/constants'
import { Search, Plus, Filter, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { CadastroCriancaModal } from '@/components/CadastroCriancaModal'

const SERIES = ['Creche','1º','2º','3º','4º','5º','6º','7º','8º','9º']

export default function ListaEspera() {
  const [criancas, setCriancas] = useState<Crianca[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroSerie, setFiltroSerie] = useState('')
  const [filtroOrigem, setFiltroOrigem] = useState('')
  const [showModal, setShowModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('criancas').select('*')
      .in('status', ['espera','sem_serie','transferir'])
      .order('data_contato', { ascending: true })

    if (busca) q = q.ilike('nome', `%${busca}%`)
    if (filtroSerie) q = q.eq('serie', filtroSerie)
    if (filtroOrigem) q = q.ilike('origem', `%${filtroOrigem}%`)

    const { data } = await q
    setCriancas(data || [])
    setLoading(false)
  }, [busca, filtroSerie, filtroOrigem])

  useEffect(() => { load() }, [load])

  const origens = ['Escola Municipal','Escola Estadual','SAP','Família','APAE','AMA','CAPSi']

  return (
    <div className="flex">
      <Sidebar />
      <main className="main-content p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{fontFamily:'var(--font-display)'}}>Lista de Espera</h1>
            <p className="text-gray-500 text-sm mt-1">{criancas.length} crianças · Até 5ª série</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={16} /> Nova criança
          </button>
        </div>

        {/* Filtros */}
        <div className="card p-4 mb-5 flex gap-3 items-center">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por nome..."
              className="oba-input pl-9"
            />
          </div>
          <select value={filtroSerie} onChange={e => setFiltroSerie(e.target.value)} className="oba-input w-40">
            <option value="">Todas as séries</option>
            {SERIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filtroOrigem} onChange={e => setFiltroOrigem(e.target.value)} className="oba-input w-52">
            <option value="">Todas as origens</option>
            {origens.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <Filter size={15} className="text-gray-400 flex-shrink-0" />
        </div>

        {/* Tabela */}
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                {['Nome','Série','Idade','Responsável','Telefone','Contato','Situação','Anamnese',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">Carregando...</td></tr>
              )}
              {!loading && criancas.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">Nenhuma criança encontrada</td></tr>
              )}
              {criancas.map(c => {
                const cfg = STATUS_CONFIG[c.status]
                const dias = diasNaLista(c.data_contato)
                return (
                  <tr key={c.id} className="crianca-row">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800 text-sm">{c.nome}</div>
                      <div className="text-xs text-gray-400">{c.origem}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.serie || <span className="text-amber-500">—</span>}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.idade || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[160px] truncate">{c.responsavel}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{c.telefone}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${dias > 60 ? 'text-red-500 font-semibold' : dias > 30 ? 'text-amber-600' : 'text-gray-400'}`}>
                        {dias > 0 ? `${dias}d` : formatDate(c.data_contato)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-pill ${cfg.bg} ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${
                        c.status_anamnese === 'realizada' ? 'text-emerald-600' :
                        c.status_anamnese === 'agendada' ? 'text-blue-600' :
                        c.status_anamnese === 'pendente' ? 'text-amber-600' : 'text-gray-300'
                      }`}>
                        {c.status_anamnese === 'nao_iniciado' ? '—' :
                         c.status_anamnese === 'agendada' ? 'Agendada' :
                         c.status_anamnese === 'realizada' ? 'Realizada' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/criancas/${c.id}`} className="text-brand-600 hover:text-brand-800">
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {showModal && (
          <CadastroCriancaModal
            onClose={() => setShowModal(false)}
            onSaved={() => { setShowModal(false); load() }}
          />
        )}
      </main>
    </div>
  )
}
