'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase, Crianca, Status } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { STATUS_CONFIG, formatDate, diasNaLista } from '@/lib/constants'
import { Search, Plus, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { CadastroCriancaModal } from '@/components/CadastroCriancaModal'

interface Props {
  titulo: string
  subtitulo: string
  statuses: Status[]
  headerColor: string
  showCadastro?: boolean
}

export function ListaPage({ titulo, subtitulo, statuses, headerColor, showCadastro = false }: Props) {
  const [criancas, setCriancas] = useState<Crianca[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [showModal, setShowModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('criancas').select('*').in('status', statuses).order('data_contato', { ascending: true })
    if (busca) q = q.ilike('nome', `%${busca}%`)
    const { data } = await q
    setCriancas(data || [])
    setLoading(false)
  }, [busca, statuses])

  useEffect(() => { load() }, [load])

  return (
    <div className="flex">
      <Sidebar />
      <main className="main-content p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 fade-up" style={{fontFamily:'var(--font-display)'}}>{titulo}</h1>
            <p className="text-gray-500 text-sm mt-1">{criancas.length} {subtitulo}</p>
          </div>
          {showCadastro && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus size={16} /> Nova criança
            </button>
          )}
        </div>

        <div className="card p-4 mb-5">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por nome..." className="oba-input pl-9" />
          </div>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className={`border-b border-gray-100 ${headerColor}`}>
                {['Nome','Série','Idade','Responsável','Telefone','Estagiário','Data Contato','Anamnese',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">Carregando...</td></tr>}
              {!loading && criancas.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">Nenhum registro encontrado</td></tr>
              )}
              {criancas.map(c => (
                <tr key={c.id} className="crianca-row">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800 text-sm">{c.nome}</div>
                    <div className="text-xs text-gray-400">{c.origem}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.serie || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.idade || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[160px] truncate">{c.responsavel}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{c.telefone}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{c.estagiario || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(c.data_contato)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${
                      c.status_anamnese === 'realizada' ? 'text-emerald-600 font-medium' :
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
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <CadastroCriancaModal
            statusInicial={statuses[0]}
            onClose={() => setShowModal(false)}
            onSaved={() => { setShowModal(false); load() }}
          />
        )}
      </main>
    </div>
  )
}
