'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, Crianca, HistoricoContato } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { STATUS_CONFIG, STATUS_CONTATO_CONFIG, STATUS_ANAMNESE_CONFIG,
         TIPO_CONTATO_CONFIG, RESULTADO_CONTATO_CONFIG, formatDate, diasNaLista } from '@/lib/constants'
import { ArrowLeft, Phone, MessageSquare, Edit2, Save, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

const SERIES = ['','Creche','1º','2º','3º','4º','5º','6º','7º','8º','9º','Ensino Médio']

export default function CriancaProfile() {
  const { id } = useParams()
  const router = useRouter()
  const [crianca, setCrianca] = useState<Crianca | null>(null)
  const [historico, setHistorico] = useState<HistoricoContato[]>([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Crianca>>({})
  const [novoContato, setNovoContato] = useState({ tipo:'whatsapp', resultado:'mensagem_enviada', observacao:'', registrado_por:'' })
  const [showNovoContato, setShowNovoContato] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from('criancas').select('*').eq('id', id).single()
      if (c) { setCrianca(c); setForm(c) }
      const { data: h } = await supabase.from('historico_contatos').select('*')
        .eq('crianca_id', id).order('data', { ascending: false })
      setHistorico(h || [])
    }
    if (id) load()
  }, [id])

  async function salvar() {
    setSaving(true)
    await supabase.from('criancas').update(form).eq('id', id)
    setCrianca({ ...crianca!, ...form })
    setEditing(false)
    setSaving(false)
  }

  async function registrarContato() {
    await supabase.from('historico_contatos').insert({
      crianca_id: id,
      data: new Date().toISOString().split('T')[0],
      ...novoContato
    })
    const { data } = await supabase.from('historico_contatos').select('*')
      .eq('crianca_id', id).order('data', { ascending: false })
    setHistorico(data || [])
    setShowNovoContato(false)
    setNovoContato({ tipo:'whatsapp', resultado:'mensagem_enviada', observacao:'', registrado_por:'' })
  }

  async function transferirMonitoria() {
    await supabase.from('criancas').update({ status: 'monitoria' }).eq('id', id)
    router.push('/monitoria')
  }

  async function desligar() {
    if (!confirm('Desligar esta criança? Ela será movida para a lista de desligadas.')) return
    await supabase.from('criancas').update({ status: 'desligada' }).eq('id', id)
    router.push('/criancas')
  }

  if (!crianca) return (
    <div className="flex"><Sidebar />
      <main className="main-content p-8 flex items-center justify-center">
        <div className="text-gray-400">Carregando...</div>
      </main>
    </div>
  )

  const cfg = STATUS_CONFIG[crianca.status]
  const dias = diasNaLista(crianca.data_contato)

  return (
    <div className="flex">
      <Sidebar />
      <main className="main-content p-8">
        {/* Breadcrumb */}
        <Link href="/criancas" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors">
          <ArrowLeft size={14} /> Lista de Espera
        </Link>

        <div className="grid grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="col-span-2 space-y-5">
            {/* Card identidade */}
            <div className="card p-6 fade-up">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h1 className="text-xl font-bold text-gray-900" style={{fontFamily:'var(--font-display)'}}>
                    {crianca.nome}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`status-pill ${cfg.bg} ${cfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                    {dias > 0 && (
                      <span className={`text-xs ${dias > 60 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                        {dias} dias na lista
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!editing ? (
                    <button onClick={() => setEditing(true)} className="btn-ghost">
                      <Edit2 size={14} /> Editar
                    </button>
                  ) : (
                    <>
                      <button onClick={() => setEditing(false)} className="btn-ghost">Cancelar</button>
                      <button onClick={salvar} disabled={saving} className="btn-primary">
                        <Save size={14} /> {saving ? 'Salvando...' : 'Salvar'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Série', field: 'serie', type: 'select', options: SERIES },
                  { label: 'Idade', field: 'idade', type: 'number' },
                  { label: 'Origem', field: 'origem', type: 'text' },
                  { label: 'Data Contato', field: 'data_contato', type: 'date' },
                  { label: 'Responsável', field: 'responsavel', type: 'text' },
                  { label: 'Telefone', field: 'telefone', type: 'text' },
                  { label: 'Estagiário', field: 'estagiario', type: 'text' },
                  { label: 'Status Anamnese', field: 'status_anamnese', type: 'select',
                    options: Object.entries(STATUS_ANAMNESE_CONFIG).map(([k,v])=>({value:k,label:v.label})) },
                  { label: 'Status Contato', field: 'status_contato', type: 'select',
                    options: Object.entries(STATUS_CONTATO_CONFIG).map(([k,v])=>({value:k,label:v.label})) },
                  { label: 'Status', field: 'status', type: 'select',
                    options: Object.entries(STATUS_CONFIG).map(([k,v])=>({value:k,label:v.label})) },
                ].map(({ label, field, type, options }) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{label}</label>
                    {editing ? (
                      type === 'select' ? (
                        <select className="oba-input" value={(form as any)[field] || ''}
                          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}>
                          {(options as any[]).map((o: any) =>
                            typeof o === 'string'
                              ? <option key={o} value={o}>{o || '(vazio)'}</option>
                              : <option key={o.value} value={o.value}>{o.label}</option>
                          )}
                        </select>
                      ) : (
                        <input type={type} className="oba-input"
                          value={(form as any)[field] || ''}
                          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                      )
                    ) : (
                      <div className="text-sm text-gray-700 py-2">
                        {(crianca as any)[field] || <span className="text-gray-300">—</span>}
                      </div>
                    )}
                  </div>
                ))}

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Observações</label>
                  {editing ? (
                    <textarea className="oba-input resize-none" rows={3}
                      value={form.observacoes || ''}
                      onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} />
                  ) : (
                    <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 min-h-[60px]">
                      {crianca.observacoes || <span className="text-gray-300">Sem observações</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Histórico de contatos */}
            <div className="card fade-up fade-up-2">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                  <Phone size={15} /> Histórico de Contatos
                </h2>
                <button onClick={() => setShowNovoContato(true)} className="btn-ghost text-xs">
                  <Plus size={13} /> Registrar
                </button>
              </div>

              {showNovoContato && (
                <div className="px-5 py-4 bg-blue-50 border-b border-blue-100">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Tipo</label>
                      <select className="oba-input" value={novoContato.tipo}
                        onChange={e => setNovoContato(n => ({ ...n, tipo: e.target.value as any }))}>
                        {Object.entries(TIPO_CONTATO_CONFIG).map(([k,v]) =>
                          <option key={k} value={k}>{v.icon} {v.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Resultado</label>
                      <select className="oba-input" value={novoContato.resultado}
                        onChange={e => setNovoContato(n => ({ ...n, resultado: e.target.value as any }))}>
                        {Object.entries(RESULTADO_CONTATO_CONFIG).map(([k,v]) =>
                          <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Estagiário</label>
                      <input className="oba-input" placeholder="Seu nome" value={novoContato.registrado_por}
                        onChange={e => setNovoContato(n => ({ ...n, registrado_por: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Observação</label>
                      <input className="oba-input" placeholder="Opcional" value={novoContato.observacao}
                        onChange={e => setNovoContato(n => ({ ...n, observacao: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowNovoContato(false)} className="btn-ghost text-xs">Cancelar</button>
                    <button onClick={registrarContato} className="btn-primary text-xs">Salvar contato</button>
                  </div>
                </div>
              )}

              <div className="divide-y divide-gray-50">
                {historico.length === 0 && (
                  <div className="px-5 py-8 text-center text-gray-300 text-sm">Nenhum contato registrado ainda</div>
                )}
                {historico.map(h => {
                  const tipo = TIPO_CONTATO_CONFIG[h.tipo as keyof typeof TIPO_CONTATO_CONFIG]
                  const resultado = RESULTADO_CONTATO_CONFIG[h.resultado as keyof typeof RESULTADO_CONTATO_CONFIG]
                  return (
                    <div key={h.id} className="flex items-start gap-3 px-5 py-3">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-sm">
                        {tipo?.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${resultado?.color}`}>{resultado?.label}</span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">{tipo?.label}</span>
                          {h.registrado_por && <>
                            <span className="text-xs text-gray-300">·</span>
                            <span className="text-xs text-gray-400">{h.registrado_por}</span>
                          </>}
                        </div>
                        {h.observacao && <div className="text-xs text-gray-500 mt-0.5">{h.observacao}</div>}
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(h.data)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Coluna lateral – ações */}
          <div className="space-y-4">
            <div className="card p-5 fade-up fade-up-1">
              <h3 className="font-semibold text-gray-700 text-sm mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <a href={`tel:${crianca.telefone}`}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors">
                  <Phone size={15} /> Ligar agora
                </a>
                <a href={`https://wa.me/55${crianca.telefone?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors">
                  <MessageSquare size={15} /> Abrir WhatsApp
                </a>
                {(crianca.status === 'transferir' || crianca.status === 'espera' || crianca.status === 'sem_serie') && (
                  <button onClick={transferirMonitoria}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-violet-50 text-violet-700 text-sm font-medium hover:bg-violet-100 transition-colors">
                    → Transferir para Monitoria
                  </button>
                )}
                <button onClick={desligar}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors">
                  <Trash2 size={14} /> Desligar
                </button>
              </div>
            </div>

            {/* Resumo rápido */}
            <div className="card p-5 fade-up fade-up-2">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Resumo</h3>
              <dl className="space-y-2.5">
                {[
                  { label: 'Série', value: crianca.serie || '—' },
                  { label: 'Idade', value: crianca.idade ? `${crianca.idade} anos` : '—' },
                  { label: 'Na lista há', value: dias > 0 ? `${dias} dias` : '—' },
                  { label: 'Contatos', value: `${historico.length}` },
                  { label: 'Anamnese', value: STATUS_ANAMNESE_CONFIG[crianca.status_anamnese]?.label || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <dt className="text-xs text-gray-400">{label}</dt>
                    <dd className="text-xs font-medium text-gray-700">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
